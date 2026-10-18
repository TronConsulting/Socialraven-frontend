import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuthUrl, disconnectAccount, getProfiles, createProfile, deleteProfile } from "../services/api";
import {
  Facebook, Twitter, Instagram, Linkedin, Youtube, Music,
  Trash2, Plus, Loader2, Globe, CheckCircle2, AlertCircle, ArrowRight, X, User, ChevronRight, Zap, Check, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/30", tag: "Stories & Reels" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", tag: "Pages & Groups" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "text-white", bg: "bg-white/10", border: "border-white/20", tag: "Posts & Media" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/30", tag: "Company & Personal" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", tag: "Videos & Shorts" },
  { id: "tiktok", name: "TikTok", icon: Music, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", tag: "Reels & Virals" },
];

const PENDING_PROFILE_KEY = "pending_connection_profile_id";
const PENDING_PLATFORM_KEY = "pending_connection_platform";

export default function Connections() {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const data = await getProfiles();
      const nextProfiles = data || [];
      setProfiles(nextProfiles);

      setSelectedProfile((current) => {
        const pendingProfileId = searchParams.get("profileId") || localStorage.getItem(PENDING_PROFILE_KEY);
        const targetId = pendingProfileId || current?.id || nextProfiles[0]?.id;
        const nextSelection = nextProfiles.find((p) => p.id === targetId) || nextProfiles[0] || null;

        if (pendingProfileId && nextSelection?.id === pendingProfileId) {
          localStorage.removeItem(PENDING_PROFILE_KEY);
          localStorage.removeItem(PENDING_PLATFORM_KEY);
        }
        return nextSelection;
      });
    } catch (err) {
      console.error("Failed to load profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;
    setActionLoading(true);
    try {
      const created = await createProfile(newProfileName.trim());
      setNewProfileName("");
      setIsCreatingProfile(false);
      await loadData();
      if (created && created.id) {
        setSelectedProfile(created);
      }
    } catch (err) {
      console.error(err);
      alert(t("connections.failedToCreate", "Failed to create profile"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this profile? All associated connections will be detached.")) return;
    setActionLoading(true);
    try {
      await deleteProfile(profileId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile");
    } finally {
      setActionLoading(false);
    }
  };

  const startAuth = async (platformId) => {
    if (!selectedProfile) return;
    setConnectingPlatform(platformId);
    try {
      localStorage.setItem(PENDING_PROFILE_KEY, selectedProfile.id);
      localStorage.setItem(PENDING_PLATFORM_KEY, platformId);
      const callbackUrl = window.location.origin + "/auth/callback";
      const data = await getAuthUrl(platformId, callbackUrl, selectedProfile.id);

      if (data?.authUrl) {
        let finalAuthUrl = data.authUrl;
        if (finalAuthUrl.includes("highshift-cloud-backend.vercel.app")) {
          finalAuthUrl = finalAuthUrl.replace(/highshift-cloud-backend\.vercel\.app%2Fauth/g, "api.socialraven.online%2Fauth%2Fconnect");
          finalAuthUrl = finalAuthUrl.replace(/highshift-cloud-backend\.vercel\.app\/auth/g, "api.socialraven.online/auth/connect");
        }
        window.location.href = finalAuthUrl;
      } else if (data?.action === "show_form") {
        alert("This platform requires custom credentials. Please check backend configuration.");
      }
    } catch (err) {
      localStorage.removeItem(PENDING_PROFILE_KEY);
      localStorage.removeItem(PENDING_PLATFORM_KEY);
      const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
      alert(`${t("connections.failedToStartAuth", "Failed to start authentication")}${detail ? `: ${detail}` : ""}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform, accountId) => {
    if (!confirm(t("connections.disconnectConfirm", "Disconnect this account?"))) return;
    setActionLoading(true);
    try {
      await disconnectAccount(platform, accountId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(t("connections.failedToDisconnect", "Failed to disconnect"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-bgColor flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-raven-500 w-10 h-10" />
        <p className="text-textMuted text-sm font-medium">Loading social workspaces...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgColor text-textMain px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderColor">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-raven-500/10 border border-raven-500/20 text-raven-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Platform Account Orchestration</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-textMain">
              {t("connections.title", "Social Connections")}
            </h1>
            <p className="text-textMuted text-sm mt-1">
              Connect and manage social accounts grouped by brand profiles for automated distribution.
            </p>
          </div>
          <button
            onClick={() => setIsCreatingProfile(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-raven-600 hover:bg-raven-500 text-white font-bold text-sm shadow-lg shadow-raven-600/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t("connections.newProfile", "New Profile")}</span>
          </button>
        </div>

        {/* Main Grid: Profiles Sidebar + Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Profiles List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-textMuted">
                {t("connections.selectProfile", "Profiles & Workspaces")}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-textMuted border border-white/10 font-semibold">
                {profiles.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {profiles.map((p) => {
                const isSelected = selectedProfile?.id === p.id;
                const accountCount = p.accounts?.length || 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfile(p)}
                    className={`group relative flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-raven-600/10 border-raven-500/80 shadow-md shadow-raven-600/10"
                        : "bg-bgSurface border-borderColor hover:border-white/20 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg transition-colors flex-shrink-0 ${
                          isSelected
                            ? "bg-raven-600 text-white shadow-md shadow-raven-600/30"
                            : "bg-white/5 text-textMuted group-hover:text-textMain border border-white/10"
                        }`}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-bold text-base truncate ${isSelected ? "text-white" : "text-textMain"}`}>
                          {p.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${accountCount > 0 ? "bg-emerald-400" : "bg-zinc-500"}`} />
                          <span className="text-xs text-textMuted font-medium">
                            {accountCount === 1 ? "1 Account Linked" : `${accountCount} Accounts Linked`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteProfile(p.id, e)}
                          title="Delete profile"
                          className="opacity-0 group-hover:opacity-100 p-2 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight
                        className={`w-5 h-5 transition-transform ${
                          isSelected ? "text-raven-400 translate-x-0.5" : "text-zinc-600 group-hover:text-textMuted"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}

              {profiles.length === 0 && !isCreatingProfile && (
                <div className="p-8 text-center bg-bgSurface border border-dashed border-borderColor rounded-2xl">
                  <User className="w-10 h-10 text-textMuted mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-semibold text-textMain mb-1">No Profiles Found</p>
                  <p className="text-xs text-textMuted mb-4">Create your first brand profile to start linking social accounts.</p>
                  <button
                    onClick={() => setIsCreatingProfile(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-raven-600 hover:bg-raven-500 text-white font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Profile Details & Connect Hub (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedProfile ? (
              <div className="space-y-6">

                {/* Profile Banner */}
                <div className="p-6 md:p-8 rounded-3xl bg-bgSurface border border-borderColor relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-raven-600/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-textMain truncate">
                          {selectedProfile.name}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-raven-500/10 text-raven-400 border border-raven-500/20 text-xs font-bold uppercase tracking-wider flex-shrink-0">
                          Active Workspace
                        </span>
                      </div>
                      <p className="text-textMuted text-sm">
                        {t("connections.orchestrate", "Connect social networks to publish, schedule, and analyze content.")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                        <div className="text-lg font-black text-textMain leading-tight">
                          {selectedProfile.accounts?.length || 0}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-textMuted">
                          Connected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Channels to Connect */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h3 className="text-base font-bold text-textMain tracking-tight">
                        Available Social Channels
                      </h3>
                      <p className="text-xs text-textMuted">
                        Click any platform to authorize and link it to <span className="text-raven-400 font-semibold">{selectedProfile.name}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      const linkedAccounts = (selectedProfile.accounts || []).filter((a) => a.platform === platform.id);
                      const isLinked = linkedAccounts.length > 0;
                      const isBusy = connectingPlatform === platform.id;

                      return (
                        <div
                          key={platform.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isLinked
                              ? "bg-bgSurface border-emerald-500/30 shadow-sm"
                              : "bg-bgSurface border-borderColor hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${platform.bg} ${platform.color} border ${platform.border} flex-shrink-0`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-textMain truncate">
                                  {platform.name}
                                </div>
                                <div className="text-[11px] text-textMuted truncate">
                                  {platform.tag}
                                </div>
                              </div>
                            </div>
                            {isLinked && (
                              <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 flex-shrink-0" title="Connected">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                          </div>

                          {isLinked ? (
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                              <span className="text-xs text-emerald-400 font-semibold truncate">
                                @{linkedAccounts[0]?.username || "Active"}
                              </span>
                              <button
                                onClick={() => startAuth(platform.id)}
                                disabled={isBusy}
                                className="text-[11px] font-bold text-textMuted hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                {isBusy ? "Connecting..." : "+ Add"}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startAuth(platform.id)}
                              disabled={isBusy}
                              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-raven-600 text-textMain hover:text-white font-bold text-xs border border-white/10 hover:border-raven-500 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                              {isBusy ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Connecting...</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Connect {platform.name}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connected Accounts Details Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-base font-bold text-textMain tracking-tight">
                      {t("connections.connectedAccounts", "Connected Accounts in this Profile")}
                    </h3>
                    <span className="text-xs text-textMuted font-medium">
                      {(selectedProfile.accounts || []).length} active
                    </span>
                  </div>

                  {!selectedProfile.accounts || selectedProfile.accounts.length === 0 ? (
                    <div className="p-12 text-center bg-bgSurface rounded-3xl border border-dashed border-borderColor">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-textMuted" />
                      </div>
                      <p className="text-sm font-bold text-textMain mb-1">
                        {t("connections.noAccountsLinked", "No Accounts Linked Yet")}
                      </p>
                      <p className="text-xs text-textMuted max-w-sm mx-auto mb-4">
                        {t("connections.linkFirstAccount", "Click any social channel above to connect your official account and start scheduling posts.")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {selectedProfile.accounts.map((acc) => {
                        const platformCfg = PLATFORMS.find((p) => p.id === acc.platform);
                        const Icon = platformCfg?.icon || Globe;
                        return (
                          <div
                            key={acc.accountId || `${acc.platform}-${acc.username}`}
                            className="flex items-center justify-between p-4 bg-bgSurface rounded-2xl border border-borderColor hover:border-white/20 transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                  platformCfg?.bg || "bg-white/10"
                                } ${platformCfg?.color || "text-textMain"} border ${
                                  platformCfg?.border || "border-white/10"
                                } flex-shrink-0`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-textMain truncate">
                                  @{acc.username || "connected_user"}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                                    {platformCfg?.name || acc.platform}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Live
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDisconnect(acc.platform, acc.accountId)}
                              disabled={actionLoading}
                              title="Disconnect account"
                              className="p-2 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-16 text-center bg-bgSurface rounded-3xl border border-dashed border-borderColor">
                <User className="w-12 h-12 text-textMuted mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-textMain mb-2">
                  {t("connections.selectProfileTitle", "Select a Profile")}
                </h3>
                <p className="text-textMuted text-sm max-w-sm mx-auto">
                  {t("connections.selectProfileDesc", "Click a profile on the left to manage its social accounts or create a new one.")}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Create Profile Modal */}
      <AnimatePresence>
        {isCreatingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#121216] border border-white/10 p-6 md:p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
            >
              <button
                onClick={() => setIsCreatingProfile(false)}
                className="absolute top-5 right-5 text-textMuted hover:text-textMain p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-raven-600/20 border border-raven-500/30 rounded-2xl flex items-center justify-center mb-5 text-raven-400">
                <Plus className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-black text-textMain tracking-tight mb-1">
                {t("connections.createProfileTitle", "Create Profile")}
              </h2>
              <p className="text-textMuted text-xs mb-6">
                Profiles group multiple social accounts for a brand, client, or workspace.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textMuted mb-2">
                    Profile / Brand Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="e.g. Acme Corp, Personal Brand"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-textMain placeholder:text-textMuted focus:outline-none focus:border-raven-500 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateProfile()}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingProfile(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-textMuted hover:text-white text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateProfile}
                    disabled={!newProfileName.trim() || actionLoading}
                    className="flex-1 py-3 px-4 rounded-xl bg-raven-600 hover:bg-raven-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Profile"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
