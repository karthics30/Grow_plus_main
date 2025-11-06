import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AddCampaignModal } from "@/components/AddCampaignModal";
import { ViewCampaignsModal } from "@/components/ViewCampaignModal";
import { v4 as uuidv4 } from "uuid";
import { Plus, FileText, Eye, Pencil, Trash2 } from "lucide-react";
import { FaCopy } from "react-icons/fa";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { API_ENDPOINTS } from "@/config/api";
import { log } from "console";
import { Campaign } from "@/types/campaign";

interface Template {
  id: string;
  name: string;
  subject: string;
  html: string;
  attachments?: string[];
  createdAt: string;
}

const Dashboard = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreating, setIsCreating] = useState(false);
const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<
    number | ""
  >("");

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    html: "",
    attachments: [] as File[],
  });
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    subject: "",
    html: "",
    attachments: [] as File[],
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [editEditorState, setEditEditorState] = useState(
    EditorState.createEmpty()
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 🟣 Campaign Management States
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [isViewCampaignsOpen, setIsViewCampaignsOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  const fetchTemplates = async (campaignId?: number) => {
    // ✅ no campaign selected → clear data
    if (!campaignId) {
      setTemplates([]);
      return;
    }

    // ✅ clear old data while fetching
    setTemplates([]);
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (campaignId) headers["campaign-id"] = String(campaignId);

      const response = await fetch(
        `${API_ENDPOINTS.listTemplates}?campaignId=${campaignId}`,
        { method: "GET" }
      );

      console.log("🧩 Fetching with headers:", headers);

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();

      // ✅ set only current campaign's templates
      setTemplates(data.data?.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Create Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    if (!selectedCampaign) {
      toast({
        title: "Error",
        description: "Please select a campaign before creating a template.",
        variant: "destructive",
      });
      setIsCreating(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newTemplate.name);
      formData.append("subject", newTemplate.subject);

      // 💡 FIX: Removed .replace(/\n/g, "<br/>") - use clean HTML from draftToHtml
      // formData.append("html", newTemplate.html);
let html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
html = html
  .replace(/<\/p><p>/g, "</p><p style='margin:0 0 10px 0;'>")
  .replace(/\n/g, "<br />");

formData.append("html", html);






      // ✅ campaignId now sent in body instead of URL param
      formData.append("campaignId", String(selectedCampaign));

      // ✅ append attachments if any
      newTemplate.attachments.forEach((file) =>
        formData.append("attachments", file)
      );

      // ✅ use POST /campaign/template (no /:id)
      const response = await fetch(API_ENDPOINTS.createTemplate, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template created successfully",
        });

        // Reset form fields
        setNewTemplate({ name: "", subject: "", html: "", attachments: [] });
        setEditorState(EditorState.createEmpty());

        // Refresh template list for the currently selected campaign filter
        if (typeof selectedCampaignFilter === "number") {
          fetchTemplates(selectedCampaignFilter);
        } else {
          fetchTemplates(selectedCampaign);
        }
      } else {
        const err = await response.json();
        console.error("Error response:", err);
        throw new Error(err.message || "Failed to create template");
      }
    } catch (error) {
      console.error("Template creation failed:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // ✏️ Edit Template
  const handleEditClick = (template: Template) => {
    setEditTemplate(template);

    setEditData({
      name: template.name,
      subject: template.subject,
      html: template.html,
      attachments: [],
    });

    // ✅ Pre-fill campaign selection if template has campaign info (assuming campaignId is on template object)
    // NOTE: This relies on your API returning the campaignId on the Template object.
    const campaignIdOnTemplate =
      (template as any).campaignId || selectedCampaignFilter;

    if (campaignIdOnTemplate) {
      setSelectedCampaign(Number(campaignIdOnTemplate));
    } else {
      setSelectedCampaign(null); // Or set to a default value/null/empty string
    }

    // ✅ Load editor content
    const contentBlock = htmlToDraft(template.html || "");
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      setEditEditorState(EditorState.createWithContent(contentState));
    }

    setIsEditOpen(true);
  };

  const handleUpdateTemplate = async (templateId: string) => {
    if (!selectedCampaign) {
      toast({
        title: "Error",
        description: "Please select a campaign before updating.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("subject", editData.subject);

    // 💡 FIX: Removed .replace(/\n/g, "<br/>") - use clean HTML from draftToHtml
  let html = draftToHtml(convertToRaw(editEditorState.getCurrentContent()));
html = html
  .replace(/<\/p><p>/g, "</p><p style='margin:0 0 10px 0;'>")
  .replace(/\n/g, "<br />");

formData.append("html", html);


    formData.append("campaignId", String(selectedCampaign));

    if (editData.attachments.length > 0 ) {
      editData.attachments.forEach((file) =>
        formData.append("attachments", file)
      );
    }else {
      editData.attachments.forEach((file) =>
        formData.append("attachments", null)
      );
    }

    try {
      const response = await fetch(API_ENDPOINTS.updateTemplate(templateId), {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "Template updated successfully",
        });

        // Refresh template list for the currently selected campaign filter
        if (typeof selectedCampaignFilter === "number") {
          fetchTemplates(selectedCampaignFilter);
        }

        setIsEditOpen(false);
      } else {
        console.error("Backend error:", result);
        toast({
          title: "Error",
          description: result.message || "Failed to update template",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Request error:", error);
      toast({
        title: "Error",
        description: "Something went wrong while updating the template.",
        variant: "destructive",
      });
    }
  };

  // ❌ Delete Template
  const handleDeleteTemplate = async (templateId: string) => {
    setDeletingId(templateId);
    try {
      const response = await fetch(API_ENDPOINTS.deleteTemplate(templateId), {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Deleted",
          description: result.message || "Template deleted successfully",
        });

        // Instantly update UI
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      } else {
        throw new Error(result.message || "Failed to delete template");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // 🟡 Editor change (create)
  const handleCreateEditorChange = (state: any) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    setNewTemplate({ ...newTemplate, html });
  };

  // 🟡 Editor change (edit)
  const handleEditEditorChange = (state: any) => {
    setEditEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    setEditData({ ...editData, html });
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.getAll);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${errText}`);
      }

      const data = await res.json();

      // ✅ Normalize backend response shape
      const campaignList = Array.isArray(data?.data)
        ? data.data.map((c: any) => ({
            id: String(c.id), // Ensure id is string for Campaign type
            name: c.CampaignName,
            description: c.Desc,
            createdAt: c.createdAt || c.created_at || new Date().toISOString(), // fallback
          }))
        : [];

      setCampaigns(campaignList);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // 🟢 Add new campaign
  const handleAddCampaign = async (
    data: Omit<Campaign, "id" | "createdAt">
  ) => {
    try {
      // ✅ Map frontend fields to backend DTO fields
      const payload = {
        CampaignName: data.name, // must match backend
        Desc: data.description, // optional field
      };

      console.log("payload", payload);

      const res = await fetch(API_ENDPOINTS.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create campaign");

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });

      setIsAddCampaignOpen(false);
      fetchCampaigns(); // refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  // ✏️ Edit campaign
  const handleEditCampaign = async (
    id: string,
    data: Omit<Campaign, "id" | "createdAt">
  ) => {
    try {
      // ✅ Map frontend fields to backend DTO keys
      const payload = {
        CampaignName: data.name,
        Desc: data.description,
      };

      const res = await fetch(API_ENDPOINTS.update(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update campaign");

      toast({
        title: "Updated",
        description: "Campaign updated successfully",
      });

      fetchCampaigns(); // refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    }
  };

  // ❌ Delete campaign
  const handleDeleteCampaign = async (id: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.delete(id), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete campaign");

      toast({
        title: "Deleted",
        description: "Campaign deleted successfully",
      });

      // Remove from UI immediately
      setCampaigns((prev) => prev.filter((c) => c.id !== id));

      // Clear templates if the deleted campaign was selected in the filter
      if (
        selectedCampaignFilter &&
        Number(selectedCampaignFilter) === Number(id)
      ) {
        setSelectedCampaignFilter("");
        setTemplates([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    if (!template) return;

    try {
      // Get next copy suffix
      const existingCopies = templates.filter(
        (t) =>
          t.name.startsWith(template.name) ||
          t.name.startsWith(`${template.name} (`)
      );

      const newCopyIndex = existingCopies.length;
      const newName = `${template.name} (${newCopyIndex})`;

      const formData = new FormData();
      formData.append("name", newName);
      formData.append("subject", template.subject);
      formData.append("html", template.html);
      formData.append("campaignId", String((template as any).campaignId));

      // if (template.attachments && template.attachments.length > 0) {
      //   template.attachments.forEach((file: any) => {
      //     formData.append("attachments", null);
      //   });
      // }

      const response = await fetch(API_ENDPOINTS.createTemplate, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Duplicate failed");

      toast({
        title: "Duplicated",
        description: `${newName} created successfully`,
      });

      if (typeof selectedCampaignFilter === "number") {
        fetchTemplates(selectedCampaignFilter);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="w-full flex items-center justify-between flex-wrap gap-4">
            {/* Left side: Title */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">Email Templates</h1>
              <p className="text-muted-foreground">
                Create and manage your email templates
              </p>
            </div>

            {/* Right side: Buttons */}
            <div className="flex gap-3 sm:ml-auto sm:justify-end w-full sm:w-auto">
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={() => setIsAddCampaignOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Campaign
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsViewCampaignsOpen(true)}
              >
                <Eye className="h-4 w-4" />
                View Campaigns
              </Button>
            </div>
          </div>
        </div>

        {/* 🟢 Create Template */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Template
            </CardTitle>
            <CardDescription>
              Design a new email template for your campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Campaign Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="campaign">Select Campaign</Label>
                  <select
                    id="campaign"
                    value={selectedCampaign ?? ""} // Use ?? "" to handle null/undefined
                    onChange={
                      (e) => setSelectedCampaign(Number(e.target.value) || null) // Set to null if value is empty string
                    }
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  >
                    <option value="">-- Select a Campaign --</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Welcome Email"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Welcome to our platform!"
                    value={newTemplate.subject}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        subject: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>HTML Content</Label>
                <div className="border rounded-md p-2">
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={handleCreateEditorChange}
                    toolbarClassName="rdw-toolbar"
                    wrapperClassName="rdw-wrapper"
                    editorClassName="rdw-editor"
                    editorStyle={{
                      minHeight: "200px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "0.75rem",
                      borderRadius: "8px",
                    }}
                    placeholder="Write your HTML email content here..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      attachments: e.target.files
                        ? Array.from(e.target.files)
                        : [],
                    })
                  }
                />
                {newTemplate.attachments.length > 0 && (
                  <ul className="text-sm text-muted-foreground mt-2">
                    {newTemplate.attachments.map((file, index) => (
                      <li key={index}>📎 {file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Template"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 🗂 Templates List */}
        <div>
          {/* ---------- Header Row ---------- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h2 className="text-2xl font-semibold">Your Templates</h2>

            {/* 🟢 Campaign Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="campaignFilter"
                className="text-sm font-medium text-gray-700"
              >
                Select Campaign:
              </label>
              <select
                id="campaignFilter"
                value={selectedCampaignFilter || ""}
                onChange={(e) => {
                  const campaignId = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  setSelectedCampaignFilter(campaignId || "");

                  // ✅ Only fetch if campaignId exists
                  if (campaignId) {
                    fetchTemplates(campaignId);
                  } else {
                    // If none selected, clear templates
                    setTemplates([]);
                  }
                }}
                className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-w-[180px]"
              >
                <option value="">Select</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ---------- Template Cards ---------- */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <div className="text-center col-span-full py-8 text-gray-500">
                Loading templates...
              </div>
            )}

            {!loading && templates.length > 0
              ? templates.map((template) => (
                  <Card
                    key={template.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {template.name}
                        </div>

                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-800"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <FaCopy className="w-4 h-4" />
                        </button>
                      </CardTitle>
                      {/* <CardDescription className="line-clamp-1">
                        {template.subject}
                      </CardDescription> */}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 👁 Preview */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>{previewTemplate?.name}</DialogTitle>
                            <DialogDescription>
                              {previewTemplate?.subject}
                            </DialogDescription>
                          </DialogHeader>

                          {/* HTML Preview */}
                          <div
  className="border rounded-lg p-4 bg-muted/30 mb-4"
  style={{ whiteSpace: "pre-wrap" }}
  dangerouslySetInnerHTML={{ __html: previewTemplate?.html || "" }}
/>


                          {/* Image Attachments */}
                          {previewTemplate?.attachments &&
                            previewTemplate.attachments.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="font-medium text-lg">
                                  Attached Image(s):
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {previewTemplate.attachments.map(
                                    (file: any, index: number) => {
                                      // Assuming your file structure and serving setup are correct for this path
                                      const imageUrl = `${
                                        import.meta.env.VITE_HOST
                                      }${file.path}`;

                                      return (  
                                        <div
                                          key={index}
                                          className="border rounded-lg p-2 bg-white shadow-sm flex flex-col items-center"
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={file.originalName}
                                            className="max-h-48 object-contain rounded-md"
                                          />
                                          <p className="text-xs mt-2 text-muted-foreground text-center break-all">
                                            {file.originalName}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                        </DialogContent>
                      </Dialog>

                      {/* ✏️ Edit & ❌ Delete */}
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleEditClick(template)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              disabled={deletingId === template.id}
                            >
                              {deletingId === template.id ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete{" "}
                                <strong>{template.name}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteTemplate(template.id)
                                }
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Confirm Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : !loading && (
                  <div className="text-center col-span-full py-8 text-gray-500">
                    {selectedCampaignFilter
                      ? "No templates found for this campaign."
                      : "Please select a campaign to view its templates."}
                  </div>
                )}
          </div>
        </div>

        {/* ✏️ Edit Template Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>Update your email template</DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editTemplate) handleUpdateTemplate(editTemplate.id);
              }}
              className="space-y-4"
            >
              {/* 🟢 Campaign Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="edit-campaign">Select Campaign</Label>
                <select
                  id="edit-campaign"
                  value={selectedCampaign ?? ""} // Use ?? "" to handle null/undefined
                  onChange={(e) =>
                    setSelectedCampaign(Number(e.target.value) || null)
                  } // Set to null if value is empty string
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                >
                  <option value="">-- Select a Campaign --</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Email Subject */}
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Email Subject</Label>
                <Input
                  id="edit-subject"
                  value={editData.subject}
                  onChange={(e) =>
                    setEditData({ ...editData, subject: e.target.value })
                  }
                  required
                />
              </div>

              {/* HTML Content */}
              <div className="space-y-2">
                <Label>HTML Content</Label>
                <div className="border rounded-md p-2">
                  <Editor
                    editorState={editEditorState}
                    onEditorStateChange={handleEditEditorChange}
                    toolbarClassName="rdw-toolbar"
                    wrapperClassName="rdw-wrapper"
                    editorClassName="rdw-editor"
                    editorStyle={{
                      minHeight: "200px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "0.75rem",
                      borderRadius: "8px",
                    }}
                    placeholder="Edit HTML content..."
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <Label htmlFor="edit-attachments">Attachments</Label>
                {editTemplate?.attachments && editTemplate.attachments.length > 0 && (
  <div className="space-y-2 mb-3">
    <Label>Existing Attachments</Label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {editTemplate.attachments.map((file: any, index: number) => {
        const imageUrl = `${import.meta.env.VITE_HOST}${file.path}`;
        return (
          <div
            key={index}
            className="relative border rounded-lg p-2 bg-white shadow-sm flex flex-col items-center group"
          >
            <img
              src={imageUrl}
              alt={file.originalName}
              className="max-h-40 object-contain rounded-md cursor-pointer"
              onClick={() => document.getElementById("edit-attachments")?.click()}
            />

            <p className="text-xs mt-2 text-muted-foreground text-center break-all">
              {file.originalName}
            </p>
          </div>
        );
      })}
    </div>
  </div>
)}

                <Input
                  id="edit-attachments"
                  type="file"
                  multiple
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      attachments: e.target.files
                        ? Array.from(e.target.files)
                        : [],
                    })
                  }
                />
                {editData.attachments.length > 0 && (
                  <ul className="text-sm text-muted-foreground mt-2">
                    {editData.attachments.map((file, index) => (
                      <li key={index}>📎 {file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 🟢 Add Campaign Modal */}
        <AddCampaignModal
          open={isAddCampaignOpen}
          onOpenChange={setIsAddCampaignOpen}
          onAdd={handleAddCampaign}
        />

        {/* 👁 View Campaigns Modal */}
        <ViewCampaignsModal
          open={isViewCampaignsOpen}
          onOpenChange={setIsViewCampaignsOpen}
          campaigns={campaigns}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
        />
      </div>
    </div>
  );
};

export default Dashboard;
