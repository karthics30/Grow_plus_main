import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Eye, ArrowLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SendLog {
  id: number;
  recipient: string;
  status: string;
  templateName: string;
  subject: string;
  error: string | null;
  sentAt: string;
  openCount: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  messageId?: string;
  repliedAt?: string | null;
}

interface ReplyData {
  id: number;
  messageId: string;
  inReplyTo: string | null;
  from: string;
  subject: string;
  bodyText: string;
  receivedAt: string;
}

const SendCampaignList = ({ onCreate }: { onCreate?: () => void }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReply, setSelectedReply] = useState<ReplyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchAllData(Number(id));
    } else {
      console.warn("⚠️ No campaignId provided in URL");
    }
  }, [id]);

  const fetchAllData = async (campaignId: number) => {
    setLoading(true);
    try {
      const [logsRes, replyRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.sendLogs}/${campaignId}`),
        fetch(API_ENDPOINTS.fetchreplydata),
      ]);

      const logsData = await logsRes.json();
      const replyData = await replyRes.json();

      if (logsData.success) {
        const processedLogs = (logsData.data || []).map((log: SendLog) => ({
          ...log,
          firstOpenedAt:
            log.openCount && log.openCount > 0 ? log.firstOpenedAt : null,
          lastOpenedAt:
            log.openCount && log.openCount > 0 ? log.lastOpenedAt : null,
        }));
        setLogs(processedLogs);
      } else {
        setLogs([]);
      }

      if (replyData.success) {
        const normalizedReplies = replyData.data.map((r: ReplyData) => ({
          ...r,
          from: r.from.match(/<([^>]+)>/)?.[1] || r.from,
        }));
        setReplies(normalizedReplies);
      } else {
        setReplies([]);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch logs or replies.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "PPpp");
  };

  const findReplyMatch = (recipient: string, subject: string) => {
    return replies.find(
      (r) =>
        r.from.toLowerCase() === recipient.toLowerCase() &&
        (r.subject.trim().toLowerCase() === subject.trim().toLowerCase() ||
          r.subject.trim().toLowerCase().includes(subject.trim().toLowerCase()))
    );
  };

  const handleViewReply = (recipient: string, subject: string) => {
    const matched = findReplyMatch(recipient, subject);
    if (matched) {
      setSelectedReply(matched);
      setIsModalOpen(true);
    } else {
      toast({
        title: "No Reply Found",
        description: "No reply matches this recipient and subject.",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </Button>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Campaign Logs</h1>
          <Button onClick={onCreate} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Campaign
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No send logs found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Seen</TableHead>
                    <TableHead>First Opened</TableHead>
                    <TableHead>Last Opened</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Reply</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const matchedReply = findReplyMatch(
                      log.recipient,
                      log.subject
                    );

                    return (
                      <TableRow key={log.id}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{log.recipient}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              log.status === "SENT"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {log.status}
                          </span>
                        </TableCell>
                        <TableCell>{log.templateName}</TableCell>
                        <TableCell>{log.subject}</TableCell>
                        <TableCell>
                          {log.openCount > 0 ? (
                            <span className="text-green-600 font-medium">
                              Seen
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Not Seen
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(log.firstOpenedAt)}</TableCell>
                        <TableCell>{formatDate(log.lastOpenedAt)}</TableCell>
                        <TableCell>{formatDate(log.sentAt)}</TableCell>
                        <TableCell>
                          {matchedReply ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewReply(log.recipient, log.subject)
                              }
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" /> View
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No Reply
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Reply Details</DialogTitle>
            <DialogDescription>
              Below is the reply content received from the recipient.
            </DialogDescription>
          </DialogHeader>
          {selectedReply && (
            <div className="space-y-3">
              <p>
                <strong>From:</strong> {selectedReply.from}
              </p>
              <p>
                <strong>Subject:</strong> {selectedReply.subject}
              </p>
              <p>
                <strong>Received At:</strong>{" "}
                {formatDate(selectedReply.receivedAt)}
              </p>
              <div className="border rounded-md bg-gray-50 p-3 whitespace-pre-wrap max-h-80 overflow-auto">
                {selectedReply.bodyText || "(No body content)"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendCampaignList;
