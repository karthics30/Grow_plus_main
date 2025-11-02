import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

interface BulkUploadContactsProps {
  onUploadSuccess?: () => void; // callback to refresh table
}

const BulkUploadContacts = ({ onUploadSuccess }: BulkUploadContactsProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 📁 Choose file
  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  // 📤 Upload file
  const handleUpload = async () => {
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

    try {
      setIsUploading(true);
      const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/user-emails/bulk-upload", {
        method: "POST",
        body: formData,
      }); 

      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();

      if (result.success > 0) {
        toast({
          title: "✅ Upload Successful",
          description: `${result.success} contact(s) uploaded successfully.`,
        });
        setUploadedFile(null);
        onUploadSuccess?.();
      } else {
        toast({
          title: "❌ Upload Failed",
          description: "No records were uploaded. Please check your file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Upload Failed",
        description: "Something went wrong during upload.",
        variant: "destructive",
      });
      console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // 📄 Download template (headers only)
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

    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    console.log("wokspw",worksheet);
    
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleDownloadTemplate}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-sm transition"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Template
      </Button>

      <Button
        onClick={handleFileClick}
        className="bg-primary text-white hover:bg-primary/90 rounded-lg px-4 py-2 shadow-sm transition"
      >
        <Upload className="w-4 h-4 mr-2" />
        Choose File
      </Button>

      <Button
        onClick={handleUpload}
        disabled={!uploadedFile || isUploading}
        className="bg-green-600 text-white hover:bg-green-700 rounded-lg px-4 py-2 shadow-sm transition"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </Button>

      {uploadedFile && (
        <p className="text-sm text-muted-foreground">Selected: {uploadedFile.name}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default BulkUploadContacts;
