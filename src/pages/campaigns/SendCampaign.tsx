import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, X, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS } from "@/config/api";

interface Template {
  id: number;
  name: string;
  subject: string;
  html: string;
  campaignId?: number;
  campaign?: { id: number; CampaignName?: string };
}

interface Campaign {
  id: number;
  CampaignName: string;
  Desc?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

const SendCampaign = ({ onCreate }: { onCreate?: () => void }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [recipients, setRecipients] = useState<User[]>([]);
  const [customSubject, setCustomSubject] = useState("");
  const [customText, setCustomText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  /* --------------------------- Fetch all initial data --------------------------- */
  useEffect(() => {
    fetchCampaigns();
    fetchUsers();
  }, []);

  // ✅ Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getAll);
      const data = await response.json();
      setCampaigns(data.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    }
  };

 // ✅ Fetch templates dynamically by selected campaign
const fetchTemplatesByCampaign = async (campaignId: number) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.listTemplates}?campaignId=${campaignId}`);
    const data = await response.json();

    console.log("🎯 Templates raw response:", data);

    // ✅ Handle nested data safely
    const templatesArray = Array.isArray(data.data?.data)
      ? data.data.data
      : Array.isArray(data.data)
      ? data.data
      : [];

    console.log("✅ Extracted templates:", templatesArray);
    setTemplates(templatesArray);

    // Optional toast feedback
    if (templatesArray.length > 0) {
      toast({
        title: "Templates Loaded",
        description: `${templatesArray.length} template(s) found for this campaign.`,
      });
    } else {
      toast({
        title: "No Templates Found",
        description: "No templates are linked to this campaign.",
      });
    }
  } catch (err) {
    console.error("❌ Error fetching templates:", err);
    toast({
      title: "Error",
      description: "Failed to fetch templates for this campaign.",
      variant: "destructive",
    });
  }
};



  // ✅ Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.userDetails);
      const data = await response.json();
      setUsers(data.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch user emails",
        variant: "destructive",
      });
    }
  };

  // ✅ Trigger template fetch when campaign changes
  useEffect(() => {
    if (selectedCampaign) {
      const campaignId = Number(selectedCampaign);
      fetchTemplatesByCampaign(campaignId);
      setSelectedTemplate("");
    } else {
      setTemplates([]);
      setSelectedTemplate("");
    }
  }, [selectedCampaign]);

  /* ----------------------------- Send campaign mail ----------------------------- */
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) {
      toast({
        title: "No campaign selected",
        description: "Please select a campaign.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template.",
        variant: "destructive",
      });
      return;
    }

    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please select at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        campaignId: Number(selectedCampaign),
        recipients: recipients.map((r) => ({
          email: r.email,
          name: r.username,
        })),
        templateName: selectedTemplate,
        ...(customSubject && { subject: customSubject }),
        ...(customText && { text: customText }),
      };

      const response = await fetch(API_ENDPOINTS.sendCampaign, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Campaign sent!",
          description: `Sent to ${recipients.length} recipient(s).`,
        });
        setRecipients([]);
        setSelectedTemplate("");
        setSelectedCampaign("");
        setCustomSubject("");
        setCustomText("");
        if (onCreate) onCreate();
      } else {
        const err = await response.json();
        console.error("Send campaign error:", err);
        throw new Error(err.message || "Failed to send campaign");
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong while sending.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  /* --------------------------- Recipient selection logic --------------------------- */
  const toggleSelectAll = (checked: boolean) =>
    setRecipients(checked ? users : []);

  const toggleUserSelection = (user: User, checked: boolean) =>
    setRecipients((prev) =>
      checked ? [...prev, user] : prev.filter((r) => r.email !== user.email)
    );

  const handleRemoveRecipient = (email: string) =>
    setRecipients((prev) => prev.filter((r) => r.email !== email));

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = recipients.length === users.length && users.length > 0;
  const isButtonDisabled =
    isSending || !selectedTemplate || recipients.length === 0;

  /* --------------------------- UI Rendering --------------------------- */
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        {onCreate && (
          <Button variant="ghost" onClick={onCreate} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        )}
        <h1 className="text-3xl font-bold">Send Campaign</h1>
        <p className="text-muted-foreground">
          Select campaign, template, and recipients
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Compose Campaign
          </CardTitle>
          <CardDescription>
            Choose campaign and template, then send to recipients
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSendCampaign} className="space-y-6">
            {/* Campaign + Template Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campaign Dropdown */}
              <div className="space-y-2">
                <Label>Select Campaign</Label>
                <Select
                  value={selectedCampaign}
                  onValueChange={setSelectedCampaign}
                  required
                >
                  <SelectTrigger id="campaign">
                    <SelectValue placeholder="Choose a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem
                        key={campaign.id}
                        value={campaign.id.toString()}
                      >
                        {campaign.CampaignName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Dropdown */}
              <div className="space-y-2">
                <Label>Select Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                  required
                  disabled={!selectedCampaign}
                >
                  <SelectTrigger id="template">
                    <SelectValue
                      placeholder={
                        selectedCampaign
                          ? "Choose a template"
                          : "Select a campaign first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No templates available for this campaign
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recipients Section */}
            <div className="space-y-2">
              <Label>
                <Users className="w-4 h-4 inline mr-2" />
                Recipients
              </Label>

              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />

              <div className="border rounded-md p-3 max-h-60 overflow-y-auto bg-muted/30">
                <div className="flex items-center space-x-2 mb-2 border-b pb-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={isAllSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                  <Label htmlFor="selectAll" className="font-semibold text-sm">
                    Select All ({users.length})
                  </Label>
                </div>

                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isChecked = recipients.some(
                      (r) => r.email === user.email
                    );
                    return (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 py-1 px-2 hover:bg-muted rounded-md"
                      >
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={isChecked}
                          onChange={(e) =>
                            toggleUserSelection(user, e.target.checked)
                          }
                        />
                        <Label
                          htmlFor={`user-${user.id}`}
                          className="cursor-pointer text-sm"
                        >
                          {user.username}
                        </Label>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No users found.
                  </p>
                )}
              </div>

              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {recipients.map((r) => (
                    <Badge key={r.email} variant="secondary" className="gap-1">
                      <span>{r.username}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(r.email)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Subject & Message */}
            <div className="space-y-4 pt-4 border-t">
              <Label>Custom Subject (optional)</Label>
              <Input
                placeholder="Override template subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              />

              <Label>Custom Text (optional)</Label>
              <Textarea
                placeholder="Add custom message"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full"
            >
              {isSending
                ? "Sending..."
                : `Send Campaign to ${recipients.length} Recipient${
                    recipients.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendCampaign;
