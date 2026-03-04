import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AccountPrivacy = () => {
  const { toast } = useToast();
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showCountry, setShowCountry] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Privacy Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Show profile on leaderboard", checked: showLeaderboard, onChange: setShowLeaderboard },
            { label: "Show country flag on profile", checked: showCountry, onChange: setShowCountry },
            { label: "Show betting history in community", checked: showHistory, onChange: setShowHistory },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <Label className="text-sm">{s.label}</Label>
              <Switch checked={s.checked} onCheckedChange={s.onChange} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Download My Data</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Export all your data including profile, simulation history, and community activity.</p>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started", description: "You'll receive a download link via email." })}>
            <Download className="w-3 h-3 mr-1" /> Request Data Export
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-base text-destructive">Delete Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">This action is irreversible. All your data will be permanently deleted.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 className="w-3 h-3 mr-1" /> Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all associated data. Type <strong>DELETE</strong> to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input placeholder="Type DELETE" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirm !== "DELETE"}
                  onClick={() => toast({ title: "Account deletion requested", description: "Processing..." })}
                >
                  Delete Forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPrivacy;
