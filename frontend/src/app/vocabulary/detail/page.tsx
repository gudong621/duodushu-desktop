"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VocabDetailContent from "../../../components/VocabDetailContent";

function VocabularyDetailContent() {
  const searchParams = useSearchParams();
  const idStr = searchParams.get('id');
  const vocabId = idStr ? parseInt(idStr) : 0;

  if (!vocabId) return <div>Invalid ID</div>;

  return (
    <VocabDetailContent 
      vocabId={vocabId} 
      showBackButton={true} 
      backUrl="/vocabulary"
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <VocabularyDetailContent />
    </Suspense>
  );
}
