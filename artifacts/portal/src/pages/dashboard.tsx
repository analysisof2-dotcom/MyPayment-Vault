import { useState, useRef, useEffect } from "react";
import { useClerk } from "@clerk/react";
import { Shield, LogOut, Check, Edit2, X, Activity, User as UserIcon, Calendar, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  useUpdateMe,
  useGetMyStats,
  useGetActivity,
  getGetMeQueryKey,
  getGetMyStatsQueryKey
} from "@workspace/api-client-react";
import { format, formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loadingProfile } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: stats, isLoading: loadingStats } = useGetMyStats({ query: { queryKey: getGetMyStatsQueryKey() } });
  const { data: activity, isLoading: loadingActivity } = useGetActivity();

  const updateMeMutation = useUpdateMe();

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayNameInput(profile.displayName);
    }
  }, [profile?.displayName]);

  const handleSaveName = () => {
    if (displayNameInput.trim() === profile?.displayName) {
      setIsEditingName(false);
      return;
    }
    
    updateMeMutation.mutate(
      { data: { displayName: displayNameInput.trim() } },
      {
        onSuccess: (updatedProfile) => {
          setIsEditingName(false);
          queryClient.setQueryData(getGetMeQueryKey(), updatedProfile);
        }
      }
    );
  };

  const cancelEdit = () => {
    setDisplayNameInput(profile?.displayName || "");
    setIsEditingName(false);
  };

  return (
    <div className="min-h-[100dvh] bg-background bg-noise flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <Shield className="w-6 h-6" />
            <span className="font-bold tracking-tight text-foreground">SafePort</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Welcome back, {loadingProfile ? <Skeleton className="h-10 w-32 inline-block align-middle ml-2" /> : <span className="text-primary">{profile?.displayName || "User"}</span>}
          </h1>
          <p className="text-muted-foreground text-lg">Your private security dashboard.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile & Stats */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Profile Card */}
            <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 animate-delay-100 fill-mode-both">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserIcon className="w-5 h-5 text-primary" />
                  Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingProfile ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Name</label>
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            value={displayNameInput} 
                            onChange={(e) => setDisplayNameInput(e.target.value)}
                            className="h-10 bg-input/50"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveName();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            disabled={updateMeMutation.isPending}
                          />
                          <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={updateMeMutation.isPending} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit} disabled={updateMeMutation.isPending} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          <span className="text-foreground font-medium">{profile?.displayName || "Not set"}</span>
                          <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground" onClick={() => setIsEditingName(true)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <div className="text-foreground font-medium truncate">{profile?.email || "Unknown"}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 animate-delay-200 fill-mode-both">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingStats ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats?.signInCount || 0}</div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Secure Logins</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {stats?.memberSince ? format(new Date(stats.memberSince), "MMM d, yyyy") : "Unknown"}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member Since</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {stats?.lastSeenAt ? formatDistanceToNow(new Date(stats.lastSeenAt), { addSuffix: true }) : "Never"}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Active</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Activity Feed */}
          <div className="lg:col-span-2">
            <Card className="h-full border-border/50 shadow-xl bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 animate-delay-300 fill-mode-both">
              <CardHeader className="pb-6 border-b border-border/50">
                <CardTitle className="text-lg">Recent Security Activity</CardTitle>
                <CardDescription className="text-muted-foreground">Logins and account changes associated with your profile.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingActivity ? (
                  <div className="p-6 space-y-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activity && activity.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {activity.map((event, i) => (
                      <div key={event.id} className="p-6 flex items-start gap-4 transition-colors hover:bg-secondary/30">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {event.description}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No recent activity</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm">We'll monitor your account and log security events here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
