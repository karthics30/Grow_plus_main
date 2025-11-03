import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Users, Mail, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const emailData = [
  { month: "Jan", sent: 4000, opened: 2400, clicked: 1200 },
  { month: "Feb", sent: 3000, opened: 1398, clicked: 900 },
  { month: "Mar", sent: 5200, opened: 3800, clicked: 1600 },
  { month: "Apr", sent: 4500, opened: 3200, clicked: 1500 },
  { month: "May", sent: 6200, opened: 4300, clicked: 1900 },
  { month: "Jun", sent: 5800, opened: 3800, clicked: 1700 },
];

const pipelineData = [
  { name: "Leads", value: 40, color: "hsl(var(--primary))" },
  { name: "Prospects", value: 30, color: "hsl(var(--chart-4))" },
  { name: "Deals", value: 20, color: "hsl(var(--accent))" },
  { name: "Customers", value: 10, color: "hsl(var(--success))" },
];

const scoreData = [
  { range: "0-20", count: 150 },
  { range: "21-40", count: 300 },
  { range: "41-60", count: 450 },
  { range: "61-80", count: 350 },
  { range: "81-100", count: 250 },
];

interface SavedRecord {
  email: string;
}

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
    savedRecords: SavedRecord[];
  } | null>(null);
  const { toast } = useToast();

  // 📁 Choose file
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
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

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user-emails/bulk-upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setUploadResult(result);

      // ✅ SUCCESS ONLY
      if (result.success > 0 && result.failed === 0) {
        toast({
          title: "✅ Upload Successful",
          description: (
            <div className="text-sm mt-2">
              <p>
                {result.success} record{result.success > 1 ? "s" : ""} added
                successfully.
              </p>
              {result.savedRecords?.length > 0 && (
                <ul className="list-disc ml-5 mt-1 space-y-1 text-green-700">
                  {result.savedRecords.map((rec: SavedRecord, idx: number) => (
                    <li key={idx}>{rec.email}</li>
                  ))}
                </ul>
              )}
            </div>
          ),
        });
      }
      // ⚠️ PARTIAL
      else if (result.success > 0 && result.failed > 0) {
        toast({
          title: "⚠️ Partial Upload",
          description: (
            <div className="text-sm mt-2 space-y-2">
              <p>
                ✅ {result.success} added | ❌ {result.failed} failed
              </p>
              {result.savedRecords?.length > 0 && (
                <div>
                  <strong className="text-green-700">Added:</strong>
                  <ul className="list-disc ml-5 mt-1 text-green-700">
                    {result.savedRecords.map(
                      (rec: SavedRecord, idx: number) => (
                        <li key={idx}>{rec.email}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
              {result.errors?.length > 0 && (
                <div>
                  <strong className="text-red-600 dark:text-red-300">
                    Failed:
                  </strong>
                  <ul className="list-disc ml-5 mt-1 text-red-600 dark:text-red-300">
                    {result.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ),
        });
      }
      // ❌ FAILED ONLY
      else if (result.success === 0 && result.failed > 0) {
        toast({
          title: "❌ Upload Failed",
          description: (
            <div className="text-sm mt-2 text-white">
              <p>
                {result.failed} record{result.failed > 1 ? "s" : ""} failed to
                upload.
              </p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                {result.errors.map((err: string, idx: number) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
      }

      setUploadedFile(null);
    } catch (error) {
      toast({
        title: "❌ Upload Failed",
        description: "Something went wrong while uploading.",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // 📄 Download Excel template (headers only)
  const handleDownloadTemplate = () => {
    const headers = [
    [
      "Username",
      "Address",
      "Company",
      "linkedin",
      "Domain",
      "Phone Number",
      "Email",
      "Country Code", // ✅ new
      "Source",       // ✅ new
      "Event",        // ✅ new
      "Score",        // ✅ new
    ],
  ];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "EmailContactsTemplate.xlsx");
  };

  return (
    <div className="max-w-7xl">
      {/* Header with Upload and Template Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your CRM overview.
          </p>
        </div>

       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-xs text-success mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-xs text-success mt-1">+3 from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-xs text-success mt-1">+5.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Email Campaign Performance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">
              Email Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--success))" }}
                />
                <Line
                  type="monotone"
                  dataKey="clicked"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Contact Score Distribution */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Contact Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="range"
                className="text-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                label={{
                  value: "Score Range",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                className="text-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Count", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
