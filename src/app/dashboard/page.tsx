"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { FaRobot } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaBug } from "react-icons/fa";
import { Target, ArrowLeft, Network } from "lucide-react";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import TopicsSidebar from "@/components/TopicsSidebar";
import NotesList from "@/components/NotesList";
import { useTopics } from '@/hooks/useTopics';
import { useNotes } from '@/hooks/useNotes';
import { useAppStore } from '@/store/useAppStore';
import GraphView from "@/components/GraphView";

export default function DashboardPage() {
  const { user, profile, signOut } = useUser();
  useAuthGuard();
  const router = useRouter();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string>('');
  const { ensureGeneratedPlansTopicExists } = useAppStore();

  // Fetch all topics
  const { topics } = useTopics();
  // Fetch all notes (no topicId, so sabhi notes)
  const { notes } = useNotes();
  
  // Initialize Generated Plans topic on component mount
  React.useEffect(() => {
    if (user) {
      ensureGeneratedPlansTopicExists();
    }
  }, [user, ensureGeneratedPlansTopicExists]);

  const handleTopicSelect = (topicId: string, topicTitle: string) => {
    setSelectedTopicId(topicId);
    setSelectedTopicTitle(topicTitle);
  };

  // Handle graph node clicks - just log for now, don't change view
  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
    // Node click karne se kuch nahi hoga, graph stable rahega
  };

  // Prepare graph data
  const graphData = {
    nodes: [
      ...topics.map((topic) => ({ id: topic.id, label: topic.title, type: 'topic' })),
      ...notes.map((note) => ({ id: note.id, label: note.title, type: 'note', topic_id: note.topic_id })),
    ],
    links: [
      ...notes.map((note) => ({ source: note.topic_id, target: note.id })),
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Nav Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 focus:outline-none"
            title="Go to homepage"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'default' }}
            disabled
          >
            <Image src="/neo.png" alt="Nerofea Logo" width={36} height={36} />
            <span className="text-2xl font-bold text-gray-900">Nerofea</span>
          </button>
          <Button 
            type="button"
            variant="outline" 
            className="text-base font-medium flex items-center gap-2 border"
            onClick={() => router.push("/ai-features")}
          >
            <FaRobot className="text-lg" /> Fea
          </Button>
          <Button 
            variant="outline" 
            className="text-base font-medium flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
            onClick={() => router.push("/graph")}
          >
            <Network className="w-4 h-4" />
            Graph
          </Button>
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-blue-400 text-white hover:from-indigo-600 hover:to-blue-500 text-base font-medium flex items-center gap-2"
            onClick={() => router.push("/grind")}
          >
            <Target className="w-4 h-4" />
            Grind
          </Button>
        </div>
        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{profile?.username}</span>
            <Image
              src={profile?.avatar_url || "/neo.png"}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full border"
            />
          </div>
          <Button type="button" variant="outline" className="ml-2" onClick={() => router.push("/profile")}>Profile</Button>
          <Button type="button" variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex h-[calc(100vh-80px)] overflow-x-hidden">
        <TopicsSidebar 
          onTopicSelect={handleTopicSelect}
          selectedTopicId={selectedTopicId}
        />
        <div className="flex-1 h-full w-full flex">
          <div className="flex-1 h-full">
            {selectedTopicId ? (
              <NotesList 
                topicId={selectedTopicId}
                topicTitle={selectedTopicTitle}
              />
            ) : (
              <div className="p-6">
                <div className="mb-6 flex items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                  Select a topic to view notes
                </div>
              </div>
            )}
          </div>
          <div className="w-[500px] h-full border-l border-gray-200 bg-white">
            <GraphView />
          </div>
        </div>
      </main>
    </div>
  );
} 