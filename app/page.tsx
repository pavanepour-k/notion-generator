"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { ErrorBoundary, ErrorDisplay, LoadingSpinner, SuccessMessage, WarningMessage } from "@/lib/error-handler";

// Type definitions for better type safety
interface NotionTemplate {
  title: string;
  sections: Array<{
    name: string;
    description: string;
  }>;
  properties: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  notes?: string;
}

interface ApiResponse {
  ok: boolean;
  template?: NotionTemplate;
  error?: string;
}

interface SaveResponse {
  ok: boolean;
  url?: string;
  id?: string;
  error?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<NotionTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  // Scroll to result when generated
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear copied state after 3 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const generate = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setSuccess(null);
    setShareUrl(null);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.ok || !data.template) {
        throw new Error(data.error || "Failed to generate template");
      }

      setResult(data.template);
      setSuccess("템플릿이 성공적으로 생성되었습니다!");
      
    } catch (e: any) {
      console.error("Generation error:", e);
      setError(e.message || "템플릿 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const copyToClipboard = useCallback(async () => {
    if (!result) return;
    
    try {
      const text = JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setSuccess("클립보드에 복사되었습니다! 노션에 붙여넣어 사용하세요.");
    } catch (error) {
      console.error("Copy error:", error);
      setError("복사에 실패했습니다. 수동으로 복사해주세요.");
    }
  }, [result]);

  const saveToGist = useCallback(async () => {
    if (!result) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ content: result })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: SaveResponse = await response.json();
      
      if (!data.ok || !data.url) {
        throw new Error(data.error || "Failed to save template");
      }

      setShareUrl(data.url);
      setSuccess("템플릿이 공유 링크로 저장되었습니다!");
      
    } catch (e: any) {
      console.error("Save error:", e);
      setError(e.message || "저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }, [result]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      generate();
    }
  }, [generate]);

  const examplePrompts = [
    "사이드프로젝트 관리 보드",
    "독서 기록 템플릿",
    "일일 계획 템플릿",
    "학습 진도 추적",
    "비용 관리 시트",
    "운동 일지",
    "여행 계획서",
    "회의록 템플릿"
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Notionify
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            노션 자동 템플릿 생성기
          </p>
          <p className="text-gray-500">
            AI가 당신의 아이디어를 완벽한 노션 템플릿으로 만들어드립니다
          </p>
        </header>

        {/* Input Section */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              원하는 템플릿의 용도를 설명해주세요
            </label>
            <textarea
              ref={textareaRef}
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="예) 사이드프로젝트 관리 보드"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={3}
              maxLength={1000}
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Ctrl+Enter로 생성하기
              </p>
              <span className="text-sm text-gray-400">
                {prompt.length}/1000
              </span>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">예시 프롬프트:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                생성 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                템플릿 생성하기
              </>
            )}
          </button>
        </section>

        {/* Status Messages */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={() => {
                setError(null);
                generate();
              }}
              title="템플릿 생성 오류"
            />
          </div>
        )}

        {success && (
          <div className="mb-6">
            <SuccessMessage 
              message={success} 
              onDismiss={() => setSuccess(null)}
            />
          </div>
        )}

        {/* Results Section */}
        {result && (
          <section ref={resultRef} className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">생성된 템플릿</h2>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  disabled={copied}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      복사됨
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      복사하기
                    </>
                  )}
                </button>
                <button
                  onClick={saveToGist}
                  disabled={saving || !!shareUrl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      저장 중...
                    </>
                  ) : shareUrl ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      저장됨
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      공유하기
                    </>
                  )}
                </button>
              </div>
            </div>

            {shareUrl && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">공유 링크:</p>
                <a 
                  href={shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {shareUrl}
                </a>
              </div>
            )}

            {/* Template Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{result.title}</h3>
              
              {result.sections.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">섹션:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.sections.map((section, index) => (
                      <li key={index} className="text-gray-600">
                        <strong>{section.name}</strong>: {section.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.properties.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">속성:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.properties.map((property, index) => (
                      <li key={index} className="text-gray-600">
                        <strong>{property.name}</strong> ({property.type}): {property.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">참고사항:</h4>
                  <p className="text-gray-600">{result.notes}</p>
                </div>
              )}
            </div>

            {/* JSON Output */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">JSON 데이터:</h4>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="mb-6">
            <a
              href="https://www.buymeacoffee.com/YOUR_ID"
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <Image
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                width={170}
                height={60}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            완전 무료로 운영되는 노션 템플릿 생성기입니다 ☕
          </p>
        </footer>
        </main>
      </div>
    </ErrorBoundary>
  );
}
