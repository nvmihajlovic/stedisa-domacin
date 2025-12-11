"use client";

import { useState } from "react";
import { UploadSimple, X, Check, Warning } from "phosphor-react";
import { showToast } from "@/lib/toast";

interface ReceiptUploaderProps {
  onUploadComplete: (data: {
    amount?: number;
    date?: string;
    items?: string[];
    description?: string;
    categoryId?: string;
    vendorName?: string;
  }) => void;
  categories?: Array<{ id: string; name: string }>;
}

export default function ReceiptUploader({ onUploadComplete, categories = [] }: ReceiptUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [matchedCategory, setMatchedCategory] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    console.log("File selected:", file.name, file.type);
    
    // Automatska detekcija formata
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|heic|heif|avif)$/i.test(file.name);
    
    if (!isPDF && !isImage) {
      console.log("Unsupported format:", file.type);
      showToast("Podržani formati: JPG, PNG, WEBP, BMP, GIF, TIFF, HEIC, HEIF, AVIF, PDF", "warning");
      return;
    }

    console.log(`Processing ${isPDF ? 'PDF' : 'image'} file...`);
    setProgress(10);
    setStatusMessage(isPDF ? "Učitavam PDF..." : "Učitavam sliku...");

    // Show preview (samo za slike, za PDF prikaži ikonu)
    if (!isImage) {
      // Za PDF prikaži placeholder
      setPreview("pdf");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    setProgress(20);

    // Upload and process OCR
    setUploading(true);
    setOcrStatus("processing");
    setStatusMessage("Analiziram dokument...");
    setProgress(30);

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      console.log("Sending request to /api/ocr");
      setStatusMessage(isPDF ? "Ekstrahujem tekst iz PDF-a..." : "Primenjujem OCR na sliku...");
      setProgress(50);
      
      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      setProgress(80);
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        setProgress(100);
        setStatusMessage("Uspešno očitano!");
        setOcrStatus("success");
        setOcrResult(data.extractedData);
        
        console.log("📦 OCR extractedData:", data.extractedData);
        console.log("🏷️ suggestedCategory:", data.extractedData.suggestedCategory);
        
        // Automatski pronađi kategoriju iz OCR sugestije
        if (data.extractedData.suggestedCategory && categories.length > 0) {
          console.log("🔍 Looking for category match...");
          console.log("📋 Available categories:", categories.map(c => `${c.name} (${c.id})`).join(', '));
          
          let matched;
          
          // Ako je suggestedCategory objekat sa id i name
          if (typeof data.extractedData.suggestedCategory === 'object') {
            console.log("🔍 Matching by ID:", data.extractedData.suggestedCategory.id);
            matched = categories.find(cat => cat.id === data.extractedData.suggestedCategory.id);
          } 
          // Ako je suggestedCategory string (legacy)
          else if (typeof data.extractedData.suggestedCategory === 'string') {
            console.log("🔍 Matching by name:", data.extractedData.suggestedCategory);
            matched = categories.find(cat => 
              cat.name.toLowerCase() === data.extractedData.suggestedCategory.toLowerCase()
            );
          }
          
          if (matched) {
            setMatchedCategory(matched.name);
            console.log(`✅ Category matched: "${matched.name}"`);
          } else {
            console.log(`❌ No matching category found!`);
          }
        } else {
          console.log(`⚠️ No suggestedCategory in response or no categories available`);
        }
        
        // Prikaži rezultate nakon kratke pauze
        setTimeout(() => {
          setShowPreviewModal(true);
        }, 500);
      } else {
        setOcrStatus("failed");
        setStatusMessage("Obrada nije uspela");
        console.error("OCR failed:", data.error);
        
        // Prikaži prilagođenu poruku u zavisnosti od greške
        let errorMessage = "OCR obrada nije uspela. Unesite podatke ručno.";
        if (data.error?.includes("skenirana slika") || data.error?.includes("fotografišete")) {
          errorMessage = "PDF je skenirana slika. Molimo Vas da fotografišete račun ili ga sačuvate kao JPG/PNG i pokušate ponovo.";
        } else if (data.error?.includes("pročitati PDF")) {
          errorMessage = "PDF nije čitljiv. Pokušajte sa slikom računa (JPG, PNG).";
        }
        
        showToast(errorMessage, "warning");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setOcrStatus("failed");
      setStatusMessage("Greška pri obradi");
      showToast("Greška pri OCR-u. Molimo unesite podatke ručno.", "error");
    } finally {
      setUploading(false);
      setProgress(0);
      console.log("OCR complete");
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setOcrStatus("idle");
    setOcrResult(null);
    setShowPreviewModal(false);
    setMatchedCategory(null);
    setProgress(0);
    setStatusMessage("");
  };

  const handleConfirm = async () => {
    if (ocrResult) {
      // Mapiranje OCR kategorije na categoryId iz baze
      let categoryId: string | undefined;
      let matchedCategoryName: string | undefined;
      
      if (ocrResult.suggestedCategory && categories.length > 0) {
        let matched;
        
        // Ako je suggestedCategory objekat sa id i name
        if (typeof ocrResult.suggestedCategory === 'object') {
          matched = categories.find(cat => cat.id === ocrResult.suggestedCategory.id);
        } 
        // Ako je suggestedCategory string (legacy)
        else if (typeof ocrResult.suggestedCategory === 'string') {
          matched = categories.find(cat => 
            cat.name.toLowerCase() === ocrResult.suggestedCategory.toLowerCase()
          );
        }
        
        if (matched) {
          categoryId = matched.id;
          matchedCategoryName = matched.name;
          console.log(`✅ Confirmed category: "${matchedCategoryName}" (${categoryId})`);
          
          // Learn from user's choice - this was a correct suggestion
          if (ocrResult.vendorName) {
            try {
              await fetch('/api/expenses/suggest-category', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  vendorName: ocrResult.vendorName,
                  categoryId: categoryId,
                  wasCorrectSuggestion: true, // User accepted the suggestion
                }),
              });
              console.log(`💾 Learned: ${ocrResult.vendorName} → ${matchedCategoryName} (correct suggestion)`);
            } catch (error) {
              console.error('Failed to record learning:', error);
            }
          }
        }
      }

      onUploadComplete({
        amount: ocrResult.amount,
        date: ocrResult.date,
        items: ocrResult.items,
        description: ocrResult.description,
        categoryId: categoryId,
        vendorName: ocrResult.vendorName, // Pass vendor for learning
      });
      setShowPreviewModal(false);
      clearPreview();
    }
  };

  const handleCancel = () => {
    setShowPreviewModal(false);
    clearPreview();
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="receipt-upload"
          />
          <label htmlFor="receipt-upload" className="cursor-pointer">
            <UploadSimple size={48} weight="duotone" className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">
              Prevucite račun ovde ili kliknite da odaberete
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, PDF do 10MB</p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            {preview === "pdf" ? (
              <div className="w-full rounded-lg p-8 bg-gray-100 flex flex-col items-center justify-center min-h-[200px]">
                <svg className="w-16 h-16 text-red-500 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H11V10H18V20H6Z" />
                </svg>
                <p className="text-gray-600 font-semibold">PDF dokument</p>
                <p className="text-sm text-gray-500 mt-1">Obrađujem sa OCR...</p>
              </div>
            ) : (
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full rounded-lg max-h-64 object-contain bg-gray-100"
              />
            )}
            {!uploading && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Upload Status sa progress barom */}
          {uploading && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-blue-700 font-medium">{statusMessage || "Obrađujem..."}</span>
                </div>
                <span className="text-blue-600 text-sm font-semibold">{progress}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {ocrStatus === "failed" && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Warning size={24} weight="bold" className="text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">OCR nije uspeo</h4>
                  <p className="text-sm text-yellow-700">
                    Slika je sačuvana, ali podaci nisu automatski očitani. Molimo unesite ih
                    ručno.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OCR Preview Modal */}
      {showPreviewModal && ocrResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="relative bg-gradient-to-br from-[#1a1b23] to-[#0f1015] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10">
            {/* Gradient Header Background */}
            <div 
              className="absolute top-0 left-0 right-0 h-32 opacity-20"
              style={{
                background: "linear-gradient(135deg, #9F70FF, #4C8BEA)",
              }}
            />
            
            <div className="relative p-6 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #9F70FF, #4C8BEA)",
                    boxShadow: "0 8px 32px rgba(159, 112, 255, 0.5)",
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  <Check size={36} weight="bold" className="text-white relative z-10" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#9F70FF] to-[#4C8BEA] bg-clip-text text-transparent mb-2">
                  OCR Uspešno!
                </h3>
                <p className="text-sm text-gray-400">
                  Proverite očitane podatke pre potvrde
                </p>
              </div>

              {/* OCR Data */}
              <div className="space-y-4">
                {ocrResult.description && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/30">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Naziv troška
                    </span>
                    <p className="text-lg font-bold text-white">{ocrResult.description}</p>
                  </div>
                )}
                
                {matchedCategory && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/30">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                      <Check size={12} weight="bold" className="text-emerald-400" />
                      {ocrResult.suggestedCategory?.isUserPreference ? 'Tvoj omiljeni izbor' : 'Predložena kategorija'}
                    </span>
                    <p className="text-lg font-bold text-white">{matchedCategory}</p>
                    <p className="text-xs text-gray-400 mt-2 italic">
                      {ocrResult.suggestedCategory?.isUserPreference
                        ? `Prošli put si izabrao "${matchedCategory}" za ovaj račun. Klikni "Potvrdi" da sačuvaš u istoj kategoriji.`
                        : `Aplikacija je prepoznala "${matchedCategory}" za ovaj račun. Ako želiš, ova kategorija će biti automatski primenjena kada klikneš "Potvrdi".`
                      }
                    </p>
                  </div>
                )}
                
                {ocrResult.amount && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/30">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Iznos
                    </span>
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#9F70FF] to-[#4C8BEA] bg-clip-text text-transparent">
                      {ocrResult.amount.toFixed(2)} RSD
                    </p>
                  </div>
                )}
                
                {ocrResult.date && (
                  <div className="bg-gradient-to-br from-teal-500/10 to-green-500/10 rounded-xl p-4 border border-teal-500/30">
                    <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      Datum
                    </span>
                    <p className="text-lg font-bold text-white">{ocrResult.date}</p>
                  </div>
                )}
                
                {ocrResult.items && ocrResult.items.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-xl p-4 border border-gray-500/30">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Stavke ({ocrResult.items.length})
                    </span>
                    <div className="max-h-32 overflow-y-auto custom-scrollbar">
                      <ul className="text-sm text-gray-300 space-y-1.5">
                        {ocrResult.items.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span className="flex-1 truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3.5 border-2 border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/5 hover:border-white/20 transition-all duration-200"
                >
                  Otkaži
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3.5 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, #9F70FF, #4C8BEA)",
                    boxShadow: "0 4px 16px rgba(159, 112, 255, 0.4)",
                  }}
                >
                  <span className="relative z-10">Potvrdi</span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
