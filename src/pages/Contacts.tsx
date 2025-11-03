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
import { count } from "console";
import { endOfDay } from "date-fns";
import { report } from "process";
import { stat } from "fs";

interface Contact {
  id: string;
  businessname: string;
  firstname: string;
  lastname: string;
  username: string;
  title?: string;
  email: string;
  countrycode?: string;
  workphone?: string;
  mobile?: string;
  vertical?: string;
  company?: string;
  endclient?: string;
  reportingmanager?: string;
  country?: string;
  state?: string;
  city?: string;
  linkedin?: string;
  source?: string;
  address: string;
  notes?: string;
  outreachdate?: string;
  updatedby?: string;
  leadstatus?: string;
  isactive?: boolean;
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

  const [selectedBusiness, setSelectedBusiness] = useState("all");
const [selectedSource, setSelectedSource] = useState("all");


  // State for Bulk Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // ✅ New state for file
  const [isUploading, setIsUploading] = useState(false); // ✅ New state for upload status
  const fileInputRef = useRef<HTMLInputElement>(null); // ✅ Ref for hidden file input

  const [formData, setFormData] = useState({
    businessname: "",
    firstname: "",
    lastname: "",
    username: "",
    title: "",
    email: "",
    countrycode: "+1",
    workphone: "",
    mobile: "",
    vertical: "",
    company: "",
    endclient: "",
    reportingmanager: "",
    country: "",
    state: "",
    city: "",
    linkedin: "",
    source: "",
    address: "",
    notes: "",
    outreachdate: "",
    updatedby: "",
    leadstatus: "",
    isactive: true,
  });

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      selectedCompany === "all" || contact.company === selectedCompany;

    const matchesDomain =
      selectedDomain === "all" || contact.title === selectedDomain;

      const matchesBusiness =
    selectedBusiness === "all" || contact.businessname === selectedBusiness;

  const matchesSource =
    selectedSource === "all" || contact.source === selectedSource;

    return matchesSearch && matchesCompany && matchesDomain &&
    matchesBusiness &&
    matchesSource;
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


  const REQUIRED_FIELDS = [
  "businessname",
  "firstname",
  "title",
  "email",
  "workphone",
  "mobile",
  "vertical",
  "company",
  "country",
  "source",
];

  const handleAddContact = async () => {
  // ✅ Validate required fields
  const missingFields = REQUIRED_FIELDS.filter(
    (field) => !formData[field as keyof typeof formData]?.toString().trim()
  );

  if (missingFields.length > 0) {
    toast({
      variant: "destructive",
      title: "Missing Required Fields",
      description: `Please fill in all required fields: ${missingFields
        .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
        .join(", ")}`,
    });
    return;
  }

  // ✅ Remove empty fields before sending
  const cleanedData = Object.fromEntries(
    Object.entries(formData).filter(([_, value]) => {
      if (typeof value === "string") return value.trim() !== "";
      return value !== null && value !== undefined;
    })
  );

  try {
    const response = await fetch(API_ENDPOINTS.createContact, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedData),
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
      businessname: contact.businessname,
      firstname: contact.firstname,
      lastname: contact.lastname,
      username: contact.username,
      title: contact.title || "",
      email: contact.email,
      countrycode: contact.countrycode || "+1",
      workphone: contact.workphone || "",
      mobile: contact.mobile || "",
      vertical: contact.vertical || "",
      company: contact.company || "",
      endclient: contact.endclient || "",
      reportingmanager: contact.reportingmanager || "",
      country: contact.country || "",
      state: contact.state || "",
      city: contact.city || "",
      linkedin: contact.linkedin || "",
      source: contact.source || "",
      address: contact.address,
      notes: contact.notes || "",
      outreachdate: contact.outreachdate || "",
      updatedby: contact.updatedby || "",
      leadstatus: contact.leadstatus || "",
      isactive: contact.isactive ?? true,
    });
    setIsEditDialogOpen(true);
  };


  const validateForm = () => {
  for (const field of REQUIRED_FIELDS) {
    const value = formData[field as keyof typeof formData];
    if (!value || value.toString().trim() === "") {
      toast({
        variant: "destructive",
        title: "Missing Required Field",
        description: `Please fill out the ${field} field.`,
      });
      return false;
    }
  }
  return true;
};


  const handleUpdateContact = async () => {
  if (!selectedContact || !validateForm()) return;

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
      businessname: contact.businessname,
      firstname: contact.firstname,
      lastname: contact.lastname,
      username: contact.username,
      title: contact.title || "",
      email: contact.email,
      countrycode: contact.countrycode || "+1",
      workphone: contact.workphone || "",
      mobile: contact.mobile || "",
      vertical: contact.vertical || "",
      company: contact.company || "",
      endclient: contact.endclient || "",
      reportingmanager: contact.reportingmanager || "",
      country: contact.country || "",
      state: contact.state || "",
      city: contact.city || "",
      linkedin: contact.linkedin || "",
      source: contact.source || "",
      address: contact.address,
      notes: contact.notes || "",
      outreachdate: contact.outreachdate || "",
      updatedby: contact.updatedby || "",
      leadstatus: contact.leadstatus || "",
      isactive: contact.isactive ?? true,
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
      businessname: "",
      firstname: "",
      lastname: "",
      username: "",
      title: "",
      email: "",
      countrycode: "+1",
      workphone: "",
      mobile: "",
      vertical: "",
      company: "",
      endclient: "",
      reportingmanager: "",
      country: "",
      state: "",
      city: "",
      linkedin: "",
      source: "",
      address: "",
      notes: "",
      outreachdate: "",
      updatedby: "",
      leadstatus: "",
      isactive: true,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // --- 📤 Bulk Upload Handlers ---

  // 1. Download Template
  const handleDownloadTemplate = () => {
    const headers = [
      [
        "businessname",
        "firstname",
        "lastname",
        "username",
        "title",
        "email",
        "countrycode",
        "workphone",
        "mobilecountrycode",
        "mobile",
        "vertical",
        "company",
        "endclient",
        "reportingmanager",
        "country",
        "state",
        "city",
        "linkedin",
        "source",
        "address",
        "notes",
        "leadstatus",
        "isactive",
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
    console.log("uolDSDA", uploadedFile);

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

        <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="All Business Names" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Business Names</SelectItem>
    {Array.from(new Set(contacts.map((c) => c.businessname))).map(
      (business) =>
        business && (
          <SelectItem key={business} value={business}>
            {business}
          </SelectItem>
        )
    )}
  </SelectContent>
</Select>

<Select value={selectedSource} onValueChange={setSelectedSource}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="All Sources" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Sources</SelectItem>
    {Array.from(new Set(contacts.map((c) => c.source))).map(
      (src) =>
        src && (
          <SelectItem key={src} value={src}>
            {src}
          </SelectItem>
        )
    )}
  </SelectContent>
</Select>



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
            <SelectValue placeholder="All Tittle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tittle</SelectItem>
            {Array.from(new Set(contacts.map((c) => c.title))).map(
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
              <TableHead>Business</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Tittle</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>linkedin</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Lead Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
         <TableBody>
  {filteredContacts.map((contact) => (
    <TableRow key={contact.id}>
      <TableCell>{contact.businessname}</TableCell>
      <TableCell>{contact.username}</TableCell>
      <TableCell>{contact.email}</TableCell>
      <TableCell>
        {contact.countrycode
          ? `${contact.countrycode} ${contact.mobile}`
          : contact.mobile}
      </TableCell>
      <TableCell>{contact.company}</TableCell>
      <TableCell>{contact.title}</TableCell>
      <TableCell>{contact.address}</TableCell>
      <TableCell>
        {contact.linkedin && (
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View Profile
          </a>
        )}
      </TableCell>
      <TableCell>{contact.source || "-"}</TableCell>

      {/* ✅ Active Column */}
      <TableCell className="text-center">
        {contact.isactive ? (
          <span className="text-green-600 font-bold">✔</span>
        ) : (
          <span className="text-red-500 font-bold">✖</span>
        )}
      </TableCell>

      <TableCell>{contact.leadstatus ?? "-"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewClick(contact)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the contact details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {/* Business & Name */}
            <div className="space-y-2">
              <Label htmlFor="businessname">Business Name <span className="text-red-500">*</span></Label>
              <Input
                id="businessname"
                name="businessname"
                value={formData.businessname}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstname">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
              />
            </div>

            {/* Username & Email */}
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
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* ✅ Country Code + Work Phone */}
            <div className="space-y-2">
              <Label htmlFor="countrycode">Country Code <span className="text-red-500">*</span></Label>
              <select
                id="countrycode"
                name="countrycode"
                value={formData.countrycode}
                onChange={handleInputChange}
                className="border rounded-md p-2 w-full"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} ({item.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Numbers */}
            <div className="space-y-2">
              <Label htmlFor="workphone">Work Phone <span className="text-red-500">*</span></Label>
              <Input
                id="workphone"
                name="workphone"
                value={formData.workphone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile <span className="text-red-500">*</span></Label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
              />
            </div>

            {/* Job Info */}
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vertical">Vertical <span className="text-red-500">*</span></Label>
              <Input
                id="vertical"
                name="vertical"
                value={formData.vertical}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endclient">End Client</Label>
              <Input
                id="endclient"
                name="endclient"
                value={formData.endclient}
                onChange={handleInputChange}
              />
            </div>

            {/* Management Info */}
            <div className="space-y-2">
              <Label htmlFor="reportingmanager">Reporting Manager</Label>
              <Input
                id="reportingmanager"
                name="reportingmanager"
                value={formData.reportingmanager}
                onChange={handleInputChange}
              />
            </div>

            {/* Location Info */}
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
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

            {/* Links & Source */}
            <div className="space-y-2 col-span-3">
              <Label htmlFor="linkedin">linkedin</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source <span className="text-red-500">*</span></Label>
              <Input
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 col-span-3">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            {/* Outreach & Status */}
            <div className="space-y-2">
              <Label htmlFor="outreachdate">Outreach Date</Label>
              <Input
                id="outreachdate"
                name="outreachdate"
                type="date"
                value={formData.outreachdate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="updatedby">Updated By</Label>
              <Input
                id="updatedby"
                name="updatedby"
                value={formData.updatedby}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadstatus">Lead Status</Label>
              <Input
                id="leadstatus"
                name="leadstatus"
                value={formData.leadstatus}
                onChange={handleInputChange}
              />
            </div>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update the contact details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {/* Business & Name */}
            <div className="space-y-2">
              <Label htmlFor="businessname">Business Name <span className="text-red-500">*</span></Label>
              <Input
                id="businessname"
                name="businessname"
                value={formData.businessname}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstname">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
              />
            </div>

            {/* Username & Email */}
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
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countrycode">Country Code <span className="text-red-500">*</span></Label>
              <select
                id="countrycode"
                name="countrycode"
                value={formData.countrycode}
                onChange={handleInputChange}
                className="border rounded-md p-2 w-full"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} ({item.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Numbers */}
            <div className="space-y-2">
              <Label htmlFor="workphone">Work Phone <span className="text-red-500">*</span></Label>
              <Input
                id="workphone"
                name="workphone"
                value={formData.workphone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile <span className="text-red-500">*</span></Label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
              />
            </div>

            {/* Job Info */}
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vertical">Vertical <span className="text-red-500">*</span></Label>
              <Input
                id="vertical"
                name="vertical"
                value={formData.vertical}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endclient">End Client</Label>
              <Input
                id="endclient"
                name="endclient"
                value={formData.endclient}
                onChange={handleInputChange}
              />
            </div>

            {/* Management Info */}
            <div className="space-y-2">
              <Label htmlFor="reportingmanager">Reporting Manager</Label>
              <Input
                id="reportingmanager"
                name="reportingmanager"
                value={formData.reportingmanager}
                onChange={handleInputChange}
              />
            </div>

            {/* Location Info */}
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
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

            {/* Links & Source */}
            <div className="space-y-2 col-span-3">
              <Label htmlFor="linkedin">linkedin</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source <span className="text-red-500">*</span></Label>
              <Input
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 col-span-3">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            {/* Outreach & Status */}
            <div className="space-y-2">
              <Label htmlFor="outreachdate">Outreach Date</Label>
              <Input
                id="outreachdate"
                name="outreachdate"
                type="date"
                value={formData.outreachdate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="updatedby">Updated By</Label>
              <Input
                id="updatedby"
                name="updatedby"
                value={formData.updatedby}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadstatus">Lead Status</Label>
              <Input
                id="leadstatus"
                name="leadstatus"
                value={formData.leadstatus}
                onChange={handleInputChange}
              />
            </div>
          </div>

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
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Contact Details</DialogTitle>
      <DialogDescription>View or edit contact information</DialogDescription>
    </DialogHeader>

    {selectedContact && (
      <div className="space-y-6 py-2">
        {/* Contact Info */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Business Name", key: "businessname" },
              { label: "First Name", key: "firstname" },
              { label: "Last Name", key: "lastname" },
              { label: "Username", key: "username" },
              { label: "Title", key: "title" },
              { label: "Email", key: "email" },
              { label: "Country Code", key: "countrycode" },
              { label: "Work Phone", key: "workphone" },
              { label: "Mobile", key: "mobile" },
            ].map(({ label, key }) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  name={key}
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  disabled={!isEditDialogOpen}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Company Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Vertical", key: "vertical" },
              { label: "Company", key: "company" },
              { label: "End Client", key: "endclient" },
              { label: "Reporting Manager", key: "reportingmanager" },
              { label: "Country", key: "country" },
              { label: "State", key: "state" },
              { label: "City", key: "city" },
              { label: "Address", key: "address" },
            ].map(({ label, key }) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  name={key}
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  disabled={!isEditDialogOpen}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="font-semibold text-lg mb-2">
            Additional Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "linkedin", key: "linkedin" },
              { label: "Source", key: "source" },
              { label: "Outreach Date", key: "outreachdate", type: "date" },
              { label: "Notes", key: "notes" },
              { label: "Updated By", key: "updatedby" },
              { label: "Lead Status", key: "leadstatus" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  name={key}
                  type={type || "text"}
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  disabled={!isEditDialogOpen}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Active Status */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Status</h3>
          <div>
            <Label htmlFor="isactive">Active</Label>
            <select
              id="isactive"
              name="isactive"
              value={formData.isactive ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isactive: e.target.value === "true",
                }))
              }
              disabled={!isEditDialogOpen}
              className="border rounded-md px-2 py-1 w-full"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        </div>
      </div>
    )}

    {/* Footer Buttons */}
    <DialogFooter className="flex justify-between items-center mt-4">
      {/* Left Buttons */}
      <div className="flex gap-2">
        {!isEditDialogOpen ? (
          <Button
            onClick={() => {
              setIsEditDialogOpen(true);
              setFormData({
                businessname: selectedContact?.businessname || "",
                firstname: selectedContact?.firstname || "",
                lastname: selectedContact?.lastname || "",
                username: selectedContact?.username || "",
                title: selectedContact?.title || "",
                email: selectedContact?.email || "",
                countrycode: selectedContact?.countrycode || "+1",
                workphone: selectedContact?.workphone || "",
                mobile: selectedContact?.mobile || "",
                vertical: selectedContact?.vertical || "",
                company: selectedContact?.company || "",
                endclient: selectedContact?.endclient || "",
                reportingmanager: selectedContact?.reportingmanager || "",
                country: selectedContact?.country || "",
                state: selectedContact?.state || "",
                city: selectedContact?.city || "",
                linkedin: selectedContact?.linkedin || "",
                source: selectedContact?.source || "",
                address: selectedContact?.address || "",
                notes: selectedContact?.notes || "",
                outreachdate: selectedContact?.outreachdate || "",
                updatedby: selectedContact?.updatedby || "",
                leadstatus: selectedContact?.leadstatus || "",
                isactive: selectedContact?.isactive ?? true,
              });
            }}
          >
            Edit
          </Button>
        ) : (
          <Button onClick={handleUpdateContact}>Save Changes</Button>
        )}
        <Button
          variant="destructive"
          onClick={() => handleDeleteClick(selectedContact!.id)}
        >
          Delete
        </Button>
      </div>

      {/* Right Button */}
      <Button
        variant="outline"
        onClick={() => {
          setIsViewDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedContact(null);
        }}
      >
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
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
