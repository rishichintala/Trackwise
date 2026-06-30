import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { FaKey, FaTrash, FaCopy, FaCheck, FaPlug } from "react-icons/fa";

const isNetlify = typeof window !== "undefined" && window.location.hostname.includes("netlify.app");
const API_BASE = isNetlify || !import.meta.env.VITE_API_BASE_URL
    ? "/api"
    : import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");

function timeAgo(dateStr) {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function Profile() {
    const { user, token, logout } = useAuth();
    const [keys, setKeys] = useState([]);
    const [loadingKeys, setLoadingKeys] = useState(true);

    // Generate modal
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [label, setLabel] = useState("Splito");
    const [generating, setGenerating] = useState(false);
    const [generatedKey, setGeneratedKey] = useState(null);
    const [copied, setCopied] = useState(false);

    // Revoke confirmation modal
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [revoking, setRevoking] = useState(false);

    const fetchKeys = useCallback(async () => {
        try {
            setLoadingKeys(true);
            const res = await axios.get(`${API_BASE}/integrations/api-keys`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setKeys(res.data);
        } catch (err) {
            if (err.response?.status === 401) { logout(); return; }
            toast.error("Failed to load API keys");
        } finally {
            setLoadingKeys(false);
        }
    }, [token, logout]);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await axios.post(
                `${API_BASE}/integrations/api-keys`,
                { label: label.trim() || "Splito" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setGeneratedKey(res.data.key);
            await fetchKeys();
        } catch (err) {
            if (err.response?.status === 401) { logout(); return; }
            toast.error(err.response?.data?.message || "Failed to generate API key");
            // Keep modal open so user can retry without re-entering the label
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Copy failed — please select and copy the key manually");
        }
    };

    const closeGenerateModal = () => {
        setShowGenerateModal(false);
        setGeneratedKey(null);
        setLabel("Splito");
        setCopied(false);
    };

    const handleRevoke = async () => {
        if (!revokeTarget) return;
        setRevoking(true);
        try {
            await axios.delete(`${API_BASE}/integrations/api-keys/${revokeTarget.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`"${revokeTarget.label}" revoked`);
            setRevokeTarget(null);
            await fetchKeys();
        } catch (err) {
            if (err.response?.status === 401) { logout(); return; }
            toast.error("Failed to revoke API key");
        } finally {
            setRevoking(false);
        }
    };

    return (
        <section className="max-w-2xl mx-auto space-y-8 p-4">

            {/* ── Account Info ── */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500">
                <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                <p className="text-gray-500 text-sm mt-1">Your account details</p>
                <div className="mt-4 space-y-2 text-sm">
                    <p className="text-gray-600">
                        <span className="font-medium text-gray-700 w-14 inline-block">Name</span>
                        {user?.name}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium text-gray-700 w-14 inline-block">Email</span>
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* ── Integrations ── */}
            <div className="bg-white p-6 rounded-xl shadow space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <FaPlug className="text-blue-500" /> Integrations
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Connect external apps to automatically log your share of split expenses.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                    >
                        <FaKey className="text-xs" /> New Key
                    </button>
                </div>

                {loadingKeys ? (
                    <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
                ) : keys.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <FaKey className="text-gray-300 text-3xl mx-auto mb-2" />
                        <p className="text-sm text-gray-400 font-medium">No API keys yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Generate a key and paste it into Splito to link your accounts.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {keys.map((k) => (
                            <li
                                key={k.id}
                                className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{k.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Created {new Date(k.createdAt).toLocaleDateString()} ·{" "}
                                        Last used: {timeAgo(k.lastUsedAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setRevokeTarget(k)}
                                    className="ml-4 text-red-400 hover:text-red-600 transition-colors p-1 shrink-0"
                                    title="Revoke key"
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="text-xs text-gray-400">
                    Maximum 5 keys. Keys can be revoked at any time — revocation is instant.
                </p>
            </div>

            {/* ══════════════ GENERATE KEY MODAL ══════════════ */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md space-y-4">
                        {!generatedKey ? (
                            /* Step 1: enter label */
                            <>
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                    <FaKey className="text-blue-500" /> Generate API Key
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Give it a label so you know which app is using it.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Label
                                    </label>
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        maxLength={50}
                                        className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        placeholder="e.g. Splito"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={closeGenerateModal}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating || !label.trim()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50 transition-colors"
                                    >
                                        {generating ? "Generating..." : "Generate"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Step 2: show generated key */
                            <>
                                <h2 className="text-lg font-semibold text-gray-700">Your New API Key</h2>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-xs text-amber-800 font-medium">
                                        Copy this key now — it will not be shown again.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <code className="text-xs text-gray-800 break-all flex-1 select-all leading-relaxed">
                                        {generatedKey}
                                    </code>
                                    <button
                                        onClick={handleCopy}
                                        className="shrink-0 p-1.5 text-blue-500 hover:text-blue-700 transition-colors"
                                        title={copied ? "Copied!" : "Copy to clipboard"}
                                    >
                                        {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Paste this key in Splito under Settings → Connect Trackwise.
                                </p>
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={closeGenerateModal}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════ REVOKE CONFIRMATION MODAL ══════════════ */}
            {revokeTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700">Revoke API Key?</h2>
                        <p className="text-sm text-gray-600">
                            Revoking{" "}
                            <span className="font-medium text-gray-800">"{revokeTarget.label}"</span>{" "}
                            will immediately block any app using it from logging expenses to your account.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setRevokeTarget(null)}
                                disabled={revoking}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRevoke}
                                disabled={revoking}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50 transition-colors"
                            >
                                {revoking ? "Revoking..." : "Revoke"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
