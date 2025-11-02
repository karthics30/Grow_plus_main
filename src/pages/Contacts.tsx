import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { Plus, Edit, Eye, Trash2, Upload, FileDown } from "lucide-react"; // Added Upload and FileDown icons
import * as XLSX from "xlsx"; // Import for Excel/Template handling

interface Contact {
  id: string;
  username: string;
  address: string;
  company?: string;
  linkedIn?: string;
  domain?: string;
  phonenumber: string;
  countryCode?: string;
  email: string;
  source?: string;
  event?: string;
  score?: number;
  updatedBy?: string; // Use string for multi-word keys
  statusDateOfRequest?: string;
  vertical?: string;
  customer?: string;
  endClient?: string;
  preferredName?: string;
  title?: string;
  reportingManager?: string;
  state?: string;
  city?: string;
  spoc?: string;
  firstOutreachDate?: string;
  lastOutreachDate?: string;
  lastOutreachTime?: string;
  nextOutreachDate?: string;
  nextOutreachTime?: string;
}
// Note: When using multi-word keys like "Updated By", you must use quotes.

// Define the structure for saved records in bulk upload (optional, based on your API response)
interface SavedRecord {
  email: string;
  // Add other fields your API returns for successfully saved records
}

const COUNTRY_CODES = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+27", country: "South Africa" },
  { code: "+82", country: "South Korea" },
  { code: "+65", country: "Singapore" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
];

const Contacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false); // ✅ New state for bulk upload dialog

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");

  // State for Bulk Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // ✅ New state for file
  const [isUploading, setIsUploading] = useState(false); // ✅ New state for upload status
  const fileInputRef = useRef<HTMLInputElement>(null); // ✅ Ref for hidden file input

  const [formData, setFormData] = useState({
  username: "",
  address: "",
  company: "",
  linkedIn: "",
  domain: "",
  phonenumber: "",
  countryCode: "+1",
  email: "",
  source: "",
  event: "",
  score: "",
  updatedBy: "",
  statusDateOfRequest: "",
  vertical: "",
  customer: "",
  endClient: "",
  preferredName: "",
  title: "",
  reportingManager: "",
  state: "",
  city: "",
  spoc: "",
  firstOutreachDate: "",
  lastOutreachDate: "",
  lastOutreachTime: "",
  nextOutreachDate: "",
  nextOutreachTime: "",
});


  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phonenumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      selectedCompany === "all" || contact.company === selectedCompany;

    const matchesDomain =
      selectedDomain === "all" || contact.domain === selectedDomain;

    return matchesSearch && matchesCompany && matchesDomain;
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.listContacts);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setContacts(data.data || data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch contacts",
      });
    }
  };

  const handleAddContact = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.createContact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create contact");

      toast({
        title: "Success",
        description: "Contact created successfully",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create contact",
      });
    }
  };

  const handleEditClick = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      username: contact.username,
      address: contact.address,
      company: contact.company || "",
      linkedIn: contact.linkedIn || "",
      domain: contact.domain || "",
      phonenumber: contact.phonenumber,
      countryCode: contact.countryCode || "+1",
      email: contact.email,
      source: contact.source || "",
      event: contact.event || "",
      score: contact.score?.toString() || "",
      updatedBy: contact.updatedBy || "",
      statusDateOfRequest: contact.statusDateOfRequest || "",
      vertical: contact.vertical || "",
      customer: contact.customer || "",
      endClient: contact.endClient || "",
      preferredName: contact.preferredName || "",
      title: contact.title || "",
      reportingManager: contact.reportingManager || "",
      state: contact.state || "",
      city: contact.city || "",
      spoc: contact.spoc || "",
      firstOutreachDate: contact.firstOutreachDate || "",
      lastOutreachDate: contact.lastOutreachDate || "",
      lastOutreachTime: contact.lastOutreachTime || "",
      nextOutreachDate: contact.nextOutreachDate || "",
      nextOutreachTime: contact.nextOutreachTime || "",
      
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(
        API_ENDPOINTS.updateContact(selectedContact.id),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to update contact");

      toast({
        title: "Success",
        description: "Contact updated successfully",
      });

      setIsEditDialogOpen(false);
      setIsViewDialogOpen(false);
      setSelectedContact(null);
      resetForm();
      fetchContacts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update contact",
      });
    }
  };

  const handleViewClick = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      username: contact.username,
      email: contact.email,
      phonenumber: contact.phonenumber,
      company: contact.company || "",
      domain: contact.domain || "",
      address: contact.address || "",
      linkedIn: contact.linkedIn || "",
      source: contact.source || "",
      event: contact.event || "",
      score: contact.score?.toString() || "",
      countryCode: contact.countryCode || "+1",
      updatedBy: contact.updatedBy || "",
      statusDateOfRequest: contact.statusDateOfRequest || "",
      vertical: contact.vertical || "",
      customer: contact.customer || "",
      endClient: contact.endClient || "",
      preferredName: contact.preferredName || "",
      title: contact.title || "",
      reportingManager: contact.reportingManager || "",
      state: contact.state || "",
      city: contact.city || "",
      spoc: contact.spoc || "",
      firstOutreachDate: contact.firstOutreachDate || "",
      lastOutreachDate: contact.lastOutreachDate || "",
      lastOutreachTime: contact.lastOutreachTime || "",
      nextOutreachDate: contact.nextOutreachDate || "",
      nextOutreachTime: contact.nextOutreachTime || "",

    });
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (contactId: string) => {
    setContactToDelete(contactId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      const response = await fetch(
        API_ENDPOINTS.deleteContact(contactToDelete),
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete contact");

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
      fetchContacts();
      setIsViewDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contact",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      address: "",
      company: "",
      linkedIn: "",
      domain: "",
      phonenumber: "",
      countryCode: "+1",
      email: "",
      source: "",
      event: "",
      score: "",
      updatedBy: "",
      statusDateOfRequest: "",
      vertical: "",
      customer: "",
      endClient: "",
      preferredName: "",
      title: "",
      reportingManager: "",
      state: "",
      city: "",
      spoc: "",
      firstOutreachDate: "",
      lastOutreachDate: "",
      lastOutreachTime: "",
      nextOutreachDate: "",
      nextOutreachTime: "",

    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- 📤 Bulk Upload Handlers ---

  // 1. Download Template
  const handleDownloadTemplate = () => {
    const headers = [
      [
        "username",
        "email",
        "phonenumber",
        "countryCode",
        "company",
        "domain",
        "address",
        "linkedIn",
        "source",
        "event",
        "score",
        // 🚀 NEW FIELDS ADDED HERE (Ensure these match the keys used in UserEmailService mapping)
        "updatedBy",
        "statusDateOfRequest",
        "vertical",
        "customer",
        "endClient",
        "preferredName",
        "title",
        "reportingManager",
        "state",
        "city",
        "spoc",
        "firstOutreachDate",
        "lastOutreachDate",
        "lastOutreachTime",
        "nextOutreachDate",
        "nextOutreachTime",
      ],
    ];
    // Create worksheet and workbook (using XLSX from the reference code)
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ContactsTemplate");
    XLSX.writeFile(workbook, "EmailContactsTemplate.xlsx");
    toast({
      title: "Template Downloaded",
      description:
        "Please fill the template and upload to add contacts in bulk.",
    });
  };

  // 2. Choose File Handler
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Optional: Show a toast notification that a file has been selected
      toast({
        title: "File Selected",
        description: `Selected file: ${file.name}`,
      });
    }
    // Clear the input value so the same file can be selected again
    if (e.target.value) e.target.value = "";
  };

  // 3. Upload File Handler
const handleBulkUpload = async () => {
  if (!uploadedFile) {
    toast({
      title: "No file selected",
      description: "Please choose a file before uploading.",
      variant: "destructive",
    });
    return;
  }

  const formData = new FormData();
  formData.append("file", uploadedFile);
console.log("uolDSDA",uploadedFile);

  // ✅ Log all data being sent to backend
  console.log("📦 FormData being sent:");
  for (let [key, value] of formData.entries()) {

    if (value instanceof File) {
      console.log(`${key}:`, value.name, `(File size: ${value.size} bytes)`);
    } else {
      console.log(`${key}:`, value);
    }
  }

  try {
    setIsUploading(true);

    const response = await fetch(API_ENDPOINTS.bulkupload, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Bulk upload failed on the server.");
    }

    if (result.success > 0 && result.failed === 0) {
      toast({
        title: "✅ Upload Successful",
        description: `${result.success} contact(s) added successfully.`,
      });
    } else if (result.success > 0 || result.failed > 0) {
      toast({
        title: "⚠️ Partial Upload",
        description: `✅ ${result.success} added | ❌ ${result.failed} failed.`,
      });
    } else {
      toast({
        title: "❌ Upload Failed",
        description:
          result.errors?.[0] || "No contacts were added. Check file format.",
        variant: "destructive",
      });
    }

    setUploadedFile(null);
    setIsBulkUploadDialogOpen(false);
    fetchContacts();
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    toast({
      title: "❌ Upload Failed",
      description:
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading.",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};


  // --- 💻 Render Section ---

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div className="flex gap-3">
          {/* ✅ Bulk Upload Button */}
          <Button
            onClick={() => {
              setIsBulkUploadDialogOpen(true);
              setUploadedFile(null); // Reset file state when opening the dialog
            }}
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          {/* Add Contact Button */}
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* 🔍 Search and Filters (existing code) */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* ... (existing search and filter code) ... */}
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <span className="absolute left-2 top-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </span>
        </div>

        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {Array.from(new Set(contacts.map((c) => c.company))).map(
              (company) =>
                company && (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>

        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {Array.from(new Set(contacts.map((c) => c.domain))).map(
              (domain) =>
                domain && (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        {/* ... (existing table code) ... */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-muted-foreground"
                >
                  No contacts found. Add your first contact to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    {contact.username}
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    {contact.countryCode
                      ? `${contact.countryCode} ${contact.phonenumber}`
                      : contact.phonenumber}
                  </TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>{contact.domain}</TableCell>
                  <TableCell>{contact.address}</TableCell>
                  <TableCell>
                    {contact.linkedIn && (
                      <a
                        href={contact.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Profile
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{contact.source || "-"}</TableCell>
                  <TableCell>{contact.event || "-"}</TableCell>
                  <TableCell>{contact.score ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(contact)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* You can re-add the Edit button here if needed, or keep editing in the view dialog */}
                      {/* <Button variant="ghost" size="icon" onClick={() => handleEditClick(contact)}>
                        <Edit className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- ⬆️ Bulk Upload Dialog (New Component) --- */}
      <Dialog
        open={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Upload Contacts</DialogTitle>
            <DialogDescription>
              Upload a spreadsheet (CSV/XLSX) to add multiple contacts at once.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <p className="text-sm text-muted-foreground">
                Download the template to ensure correct column headers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Choose File</Label>
              <Button
                onClick={handleFileClick}
                variant="outline"
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadedFile
                  ? `Change File: ${uploadedFile.name}`
                  : "Select File (CSV or XLSX)"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkUploadDialogOpen(false);
                setUploadedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={!uploadedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Contacts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --- End Bulk Upload Dialog --- */}

      {/* ... (existing Add, Edit, View, Delete Dialogs) ... */}
      {/* ✅ Add Contact Dialog */}
      

      {/* ✅ Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        {/* ... (DialogHeader) ... */}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the contact details below
            </DialogDescription>
          </DialogHeader>
          {/* Increased grid to cols-3 for better layout of many fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {/* Existing Fields */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phonenumber">Phone Number</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, countryCode: value })
                  }
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.code} {item.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phonenumber"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 col-span-3">
              <Label htmlFor="linkedIn">LinkedIn</Label>
              <Input
                id="linkedIn"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event">Event</Label>
              <Input
                id="event"
                name="event"
                value={formData.event}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                name="score"
                type="number"
                value={formData.score}
                onChange={handleInputChange}
              />
            </div>
            
            {/* 🚀 NEW FIELDS ADDED HERE */}
            <div className="space-y-2">
              <Label htmlFor="updatedBy">Updated By</Label>
              <Input
                id="updatedBy"
                name="updatedBy"
                value={formData.updatedBy}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusDateOfRequest">Status Date of Request</Label>
              <Input
                id="statusDateOfRequest"
                name="statusDateOfRequest"
                type="date"
                value={formData.statusDateOfRequest}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vertical">Vertical</Label>
              <Input
                id="vertical"
                name="vertical"
                value={formData.vertical}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endClient">End Client</Label>
              <Input
                id="endClient"
                name="endClient"
                value={formData.endClient}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportingManager">Reporting Manager</Label>
              <Input
                id="reportingManager"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spoc">SPOC</Label>
              <Input
                id="spoc"
                name="spoc"
                value={formData.spoc}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstOutreachDate">First Outreach Date</Label>
              <Input
                id="firstOutreachDate"
                name="firstOutreachDate"
                type="date"
                value={formData.firstOutreachDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastOutreachDate">Last Outreach Date</Label>
              <Input
                id="lastOutreachDate"
                name="lastOutreachDate"
                type="date"
                value={formData.lastOutreachDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastOutreachTime">Last Outreach Time</Label>
              <Input
                id="lastOutreachTime"
                name="lastOutreachTime"
                type="time"
                value={formData.lastOutreachTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOutreachDate">Next Outreach Date</Label>
              <Input
                id="nextOutreachDate"
                name="nextOutreachDate"
                type="date"
                value={formData.nextOutreachDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOutreachTime">Next Outreach Time</Label>
              <Input
                id="nextOutreachTime"
                name="nextOutreachTime"
                type="time"
                value={formData.nextOutreachTime}
                onChange={handleInputChange}
              />
            </div>
            {/* End NEW FIELDS */}

          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ✅ Edit Contact Dialog */}

      {/* ✅ Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {" "}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {" "}
          <DialogHeader>
            {" "}
            <DialogTitle>Edit Contact</DialogTitle>{" "}
            <DialogDescription>
              Update the contact details below
            </DialogDescription>{" "}
          </DialogHeader>{" "}
          {/* Increased grid to cols-3 for better layout of many fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {" "}
            {/* Existing Fields */}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-username">Username</Label>{" "}
              <Input
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-email">Email</Label>{" "}
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-phonenumber">Phone Number</Label>{" "}
              <div className="flex gap-2">
                {" "}
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, countryCode: value })
                  }
                >
                  {" "}
                  <SelectTrigger className="w-[100px]">
                    {" "}
                    <SelectValue />{" "}
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    {COUNTRY_CODES.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {" "}
                        {item.code} {item.country}{" "}
                      </SelectItem>
                    ))}{" "}
                  </SelectContent>{" "}
                </Select>{" "}
                <Input
                  id="edit-phonenumber"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-company">Company</Label>{" "}
              <Input
                id="edit-company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-domain">Domain</Label>{" "}
              <Input
                id="edit-domain"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-address">Address</Label>{" "}
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            <div className="space-y-2 col-span-3">
              {" "}
              <Label htmlFor="edit-linkedIn">LinkedIn</Label>{" "}
              <Input
                id="edit-linkedIn"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-source">Source</Label>{" "}
              <Input
                id="edit-source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-event">Event</Label>{" "}
              <Input
                id="edit-event"
                name="event"
                value={formData.event}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="edit-score">Score</Label>{" "}
              <Input
                id="edit-score"
                name="score"
                type="number"
                value={formData.score}
                onChange={handleInputChange}
              />{" "}
            </div>{" "}
            
            {/* 🚀 NEW FIELDS ADDED HERE */}
            <div className="space-y-2">
              <Label htmlFor="updatedBy">Updated By</Label>
              <Input
                id="updatedBy"
                name="updatedBy"
                value={formData.updatedBy}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusDateOfRequest">Status Date of Request</Label>
              <Input
                id="statusDateOfRequest"
                name="statusDateOfRequest"
                type="date"
                value={formData.statusDateOfRequest}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vertical">Vertical</Label>
              <Input
                id="edit-vertical"
                name="vertical"
                value={formData.vertical}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endClient">End Client</Label>
              <Input
                id="endClient"
                name="endClient"
                value={formData.endClient}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportingManager">Reporting Manager</Label>
              <Input
                id="reportingManager"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spoc">SPOC</Label>
              <Input
                id="spoc"
                name="spoc"
                value={formData.spoc}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstOutreachDate">First Outreach Date</Label>
              <Input
                id="firstOutreachDate"
                name="firstOutreachDate"
                type="date"
                value={formData.firstOutreachDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastOutreachDate">Last Outreach Date</Label>
              <Input
                id="lastOutreachDate"
                name="lastOutreachDate"
                type="date"
                value={formData.lastOutreachDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastOutreachTime">Last Outreach Time</Label>
              <Input
                id="lastOutreachTime"
                name="lastOutreachTime"
                type="time"
                value={formData.lastOutreachTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOutreachDate">Next Outreach Date</Label>
              <Input
                id="nextOutreachDate"
                name="nextOutreachDate"
                type="date"
                value={formData.nextOutreachDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOutreachTime">Next Outreach Time</Label>
              <Input
                id="nextOutreachTime"
                name="nextOutreachTime"
                type="time"
                value={formData.nextOutreachTime}
                onChange={handleInputChange}
              />
            </div>
            {/* End NEW FIELDS */}
            
          </div>{" "}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedContact(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateContact}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ... (rest of the code) ... */}
      {/* ✅ View Contact Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {" "}
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {" "}
          <DialogHeader>
            {" "}
            <DialogTitle>Contact Details</DialogTitle>{" "}
            <DialogDescription>
              View or edit contact information
            </DialogDescription>{" "}
          </DialogHeader>{" "}
          {selectedContact && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {" "}
              {[
                { label: "Username", key: "username" },
                { label: "Email", key: "email" },
                { label: "Phone Number", key: "phonenumber" },
                { label: "Company", key: "company" },
                { label: "Domain", key: "domain" },
                { label: "Address", key: "address" },
                { label: "LinkedIn", key: "linkedIn" },
                { label: "Source", key: "source" },
                { label: "Event", key: "event" },
                { label: "Score", key: "score" },
                { label: "Updated By", key: "updatedBy" },
                { label: "Status Date of Request", key: "statusDateOfRequest" },
                { label: "Vertical", key: "vertical" }, 
                { label: "Customer", key: "customer" },
                { label: "End Client", key: "endClient" },
                { label: "Preferred Name", key: "preferredName" },
                { label: "Title", key: "title" }, 
                { label: "Reporting Manager", key: "reportingManager" },
                { label: "State", key: "state" },
                { label: "City", key: "city" },
                { label: "SPOC", key: "spoc" },
                { label: "First Outreach Date", key: "firstOutreachDate" },
                { label: "Last Outreach Date", key: "lastOutreachDate" },
                { label: "Last Outreach Time", key: "lastOutreachTime" },
                { label: "Next Outreach Date", key: "nextOutreachDate" },
                { label: "Next Outreach Time", key: "nextOutreachTime" },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  {" "}
                  <Label htmlFor={key}>{label}</Label>{" "}
                  <Input
                    id={key}
                    name={key}
                    value={formData[key as keyof typeof formData] || ""}
                    onChange={handleInputChange}
                    disabled={!isEditDialogOpen}
                  />{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
          <DialogFooter className="flex justify-between items-center">
            {" "}
            {/* Left side: Edit/Delete */}{" "}
            <div className="flex gap-2">
              {" "}
              {!isEditDialogOpen ? (
                <Button
                  variant="default"
                  onClick={() => {
                    setIsEditDialogOpen(true);
                    setFormData({
                      username: selectedContact?.username || "",
                      email: selectedContact?.email || "",
                      phonenumber: selectedContact?.phonenumber || "",
                      company: selectedContact?.company || "",
                      domain: selectedContact?.domain || "",
                      address: selectedContact?.address || "",
                      linkedIn: selectedContact?.linkedIn || "",
                      source: selectedContact?.source || "",
                      event: selectedContact?.event || "",
                      score: selectedContact?.score?.toString() || "",
                      countryCode: selectedContact?.countryCode || "+1",
                      updatedBy: selectedContact?.updatedBy || "",
                      statusDateOfRequest:
                        selectedContact?.statusDateOfRequest || "",
                      vertical: selectedContact?.vertical || "",
                      customer: selectedContact?.customer || "",
                      endClient: selectedContact?.endClient || "",
                      preferredName: selectedContact?.preferredName || "",
                      title: selectedContact?.title || "",
                      reportingManager:
                        selectedContact?.reportingManager || "",
                      state: selectedContact?.state || "",
                      city: selectedContact?.city || "",
                      spoc: selectedContact?.spoc || "",
                      firstOutreachDate:
                        selectedContact?.firstOutreachDate || "",
                      lastOutreachDate:
                        selectedContact?.lastOutreachDate || "",
                      lastOutreachTime:
                        selectedContact?.lastOutreachTime || "",
                      nextOutreachDate:
                        selectedContact?.nextOutreachDate || "",
                      nextOutreachTime:
                        selectedContact?.nextOutreachTime || "",

                    });
                  }}
                >
                  {" "}
                  Edit{" "}
                </Button>
              ) : (
                <Button onClick={handleUpdateContact}>Save Changes</Button>
              )}{" "}
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick(selectedContact!.id)}
              >
                {" "}
                Delete{" "}
              </Button>{" "}
            </div>{" "}
            {/* Right side: Close */}{" "}
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedContact(null);
              }}
            >
              {" "}
              Close{" "}
            </Button>{" "}
          </DialogFooter>{" "}
        </DialogContent>{" "}
      </Dialog>
      {/* ✅ Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        {/* ... (Delete Confirmation Dialog Content) ... */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contacts;
