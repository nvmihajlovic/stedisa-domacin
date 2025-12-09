"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash, Tag, PencilSimple, Eye, EyeSlash } from "phosphor-react";
import { getIcon } from "@/lib/iconMapping";
import EditCategoryModal from "@/lib/components/EditCategoryModal";
import DeleteCategoryModal from "@/lib/components/DeleteCategoryModal";
import AddCategoryModal from "@/lib/components/AddCategoryModal";
import HelpButton from "@/components/HelpButton";
import {
  useCategories,
  useIncomeCategories,
  createCategory,
  createIncomeCategory,
  updateCategory,
  updateIncomeCategory,
  deleteCategory,
  deleteIncomeCategory,
  checkCategoryUsage,
} from "@/lib/hooks/useCategories";
import { showToast } from "@/lib/toast";

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

interface IncomeCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isLoanRepayment: boolean;
  isActive?: boolean;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { categories: expenseCategories, isLoading: loadingExpenses, mutate: mutateExpenses } = useCategories();
  const { incomeCategories, isLoading: loadingIncomes, mutate: mutateIncomes } = useIncomeCategories();
  
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteHasTransactions, setDeleteHasTransactions] = useState(false);
  const [deleteTransactionCount, setDeleteTransactionCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const loading = loadingExpenses || loadingIncomes;

  const handleEditCategory = (category: Category | IncomeCategory, type: 'expense' | 'income') => {
    setEditingCategory({ ...category, type });
    setShowEditModal(true);
  };

  const handleSaveCategory = async (updatedCategory: any) => {
    try {
      if (updatedCategory.type === 'expense') {
        await updateCategory(updatedCategory.id, {
          name: updatedCategory.name,
          icon: updatedCategory.icon,
          color: updatedCategory.color,
        });
        mutateExpenses();
      } else {
        await updateIncomeCategory(updatedCategory.id, {
          name: updatedCategory.name,
          icon: updatedCategory.icon,
          color: updatedCategory.color,
        });
        mutateIncomes();
      }
      
      showToast("Kategorija uspešno sačuvana", "success");
      setShowEditModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      showToast(error instanceof Error ? error.message : "Greška pri čuvanju kategorije", "error");
    }
  };

  const handleAddCategory = async (newCategory: { name: string; icon: string; color: string; type: 'expense' | 'income' }) => {
    try {
      if (newCategory.type === 'expense') {
        await createCategory({
          name: newCategory.name,
          icon: newCategory.icon,
          color: newCategory.color,
        });
        mutateExpenses();
      } else {
        await createIncomeCategory({
          name: newCategory.name,
          icon: newCategory.icon,
          color: newCategory.color,
          isLoanRepayment: false,
        });
        mutateIncomes();
      }
      
      showToast("Kategorija uspešno dodata", "success");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding category:", error);
      showToast(error instanceof Error ? error.message : "Greška pri dodavanju kategorije", "error");
    }
  };

  const handleDeleteCategory = async (category: Category | IncomeCategory, type: 'expense' | 'income') => {
    try {
      const checkData = await checkCategoryUsage(category.id, type);

      setDeletingCategory({ ...category, type });
      setDeleteHasTransactions(checkData.hasTransactions);
      setDeleteTransactionCount(checkData.count || 0);
      setShowDeleteModal(true);
    } catch (error) {
      console.error("Error checking category:", error);
      showToast(error instanceof Error ? error.message : "Greška pri provjeri kategorije", "error");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      if (deletingCategory.type === 'expense') {
        await deleteCategory(deletingCategory.id);
        mutateExpenses();
      } else {
        await deleteIncomeCategory(deletingCategory.id);
        mutateIncomes();
      }
      
      showToast("Kategorija uspešno obrisana", "success");
      setShowDeleteModal(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast(error instanceof Error ? error.message : "Greška pri brisanju kategorije", "error");
    }
  };

  const handleToggleActive = async (category: Category | IncomeCategory, type: 'expense' | 'income') => {
    try {
      const currentStatus = category.isActive !== false; // undefined ili true => active
      const newStatus = !currentStatus;
      
      if (type === 'expense') {
        await updateCategory(category.id, {
          isActive: newStatus,
        });
        mutateExpenses();
      } else {
        await updateIncomeCategory(category.id, {
          isActive: newStatus,
        });
        mutateIncomes();
      }
      
      showToast(
        newStatus ? "Kategorija aktivirana" : "Kategorija deaktivirana",
        "success"
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      showToast(error instanceof Error ? error.message : "Greška pri promjeni statusa", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0C1D] flex items-center justify-center">
        <div className="text-white text-xl">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F17] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#A5A4B6'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = '#A5A4B6';
            }}
          >
            <ArrowLeft size={20} weight="duotone" />
            <span className="font-medium">Nazad</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(159, 112, 255, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                border: '1px solid rgba(167, 139, 250, 0.2)'
              }}
            >
              <Tag size={24} weight="duotone" style={{ color: '#A78BFA' }} />
            </div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: '"Inter", "Poppins", sans-serif' }}>Kategorije</h1>
          </div>
          <div className="w-32"></div>
        </div>

        {/* Expense Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold" style={{ color: '#FF6B9D', fontFamily: '"Inter", sans-serif' }}>
              Kategorije troškova
            </h2>
            <span className="text-sm px-3 py-1 rounded-lg" style={{ 
              background: 'rgba(255, 107, 157, 0.1)', 
              color: '#FF6B9D',
              border: '1px solid rgba(255, 107, 157, 0.2)'
            }}>
              {expenseCategories?.length || 0} kategorija
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {expenseCategories?.map((category, index) => {
              const IconComponent = getIcon(category.icon);
              const isActive = category.isActive !== false;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-1 rounded-2xl transition-all duration-300 cursor-pointer group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.15) 0%, rgba(159, 112, 255, 0.1) 100%)',
                    opacity: isActive ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (isActive) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 157, 0.25) 0%, rgba(159, 112, 255, 0.2) 100%)';
                      e.currentTarget.style.boxShadow = '0 0 25px -5px rgba(255, 107, 157, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 157, 0.15) 0%, rgba(159, 112, 255, 0.1) 100%)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="rounded-2xl backdrop-blur-xl p-5" 
                    style={{
                      background: 'rgba(20, 18, 38, 0.85)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                          style={{
                            background: category.color ? `${category.color}20` : 'rgba(255, 107, 157, 0.15)',
                            color: category.color || '#FF6B9D',
                            border: `1px solid ${category.color ? `${category.color}40` : 'rgba(255, 107, 157, 0.3)'}`,
                            filter: isActive ? 'none' : 'grayscale(100%)',
                          }}
                        >
                          <IconComponent size={24} weight="duotone" />
                        </div>
                        {!isActive && (
                          <span 
                            className="text-xs px-2 py-1 rounded-md font-semibold"
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}
                          >
                            Neaktivna
                          </span>
                        )}
                      </div>
                      
                      {/* Control buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category, 'expense');
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(167, 139, 250, 0.1)',
                            border: '1px solid rgba(167, 139, 250, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.2)';
                          }}
                        >
                          <PencilSimple size={14} weight="duotone" style={{ color: '#A78BFA' }} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category, 'expense');
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(255, 107, 157, 0.1)',
                            border: '1px solid rgba(255, 107, 157, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 107, 157, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 107, 157, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.2)';
                          }}
                        >
                          <Trash size={14} weight="duotone" style={{ color: '#FF6B9D' }} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(category, 'expense');
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: isActive ? 'rgba(69, 211, 138, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: isActive ? '1px solid rgba(69, 211, 138, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isActive ? 'rgba(69, 211, 138, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = isActive ? 'rgba(69, 211, 138, 0.4)' : 'rgba(255, 255, 255, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isActive ? 'rgba(69, 211, 138, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = isActive ? 'rgba(69, 211, 138, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                          }}
                        >
                          {isActive ? (
                            <Eye size={14} weight="duotone" style={{ color: '#45D38A' }} />
                          ) : (
                            <EyeSlash size={14} weight="duotone" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Category info */}
                    <div className="flex flex-col">
                      <p className="font-semibold text-white mb-1" style={{ fontFamily: '"Inter", sans-serif' }}>
                        {category.name}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        {category.icon || 'Question'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Income Categories */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold" style={{ color: '#45D38A', fontFamily: '"Inter", sans-serif' }}>
              Kategorije prihoda
            </h2>
            <span className="text-sm px-3 py-1 rounded-lg" style={{ 
              background: 'rgba(69, 211, 138, 0.1)', 
              color: '#45D38A',
              border: '1px solid rgba(69, 211, 138, 0.2)'
            }}>
              {incomeCategories?.length || 0} kategorija
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {incomeCategories?.map((category, index) => {
              const IconComponent = getIcon(category.icon);
              const isActive = category.isActive !== false;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-1 rounded-2xl transition-all duration-300 cursor-pointer group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(69, 211, 138, 0.15) 0%, rgba(77, 181, 255, 0.1) 100%)',
                    opacity: isActive ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (isActive) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(69, 211, 138, 0.25) 0%, rgba(77, 181, 255, 0.2) 100%)';
                      e.currentTarget.style.boxShadow = '0 0 25px -5px rgba(69, 211, 138, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(69, 211, 138, 0.15) 0%, rgba(77, 181, 255, 0.1) 100%)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="rounded-2xl backdrop-blur-xl p-5" 
                    style={{
                      background: 'rgba(20, 18, 38, 0.85)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                          style={{
                            background: category.color ? `${category.color}20` : 'rgba(69, 211, 138, 0.15)',
                            color: category.color || '#45D38A',
                            border: `1px solid ${category.color ? `${category.color}40` : 'rgba(69, 211, 138, 0.3)'}`,
                            filter: isActive ? 'none' : 'grayscale(100%)',
                          }}
                        >
                          <IconComponent size={24} weight="duotone" />
                        </div>
                        {!isActive && (
                          <span 
                            className="text-xs px-2 py-1 rounded-md font-semibold"
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}
                          >
                            Neaktivna
                          </span>
                        )}
                      </div>
                      
                      {/* Control buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category, 'income');
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(167, 139, 250, 0.1)',
                            border: '1px solid rgba(167, 139, 250, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.2)';
                          }}
                        >
                          <PencilSimple size={14} weight="duotone" style={{ color: '#A78BFA' }} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category, 'income');
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(69, 211, 138, 0.1)',
                            border: '1px solid rgba(69, 211, 138, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(69, 211, 138, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(69, 211, 138, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(69, 211, 138, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(69, 211, 138, 0.2)';
                          }}
                        >
                          <Trash size={14} weight="duotone" style={{ color: '#45D38A' }} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(category, 'income');
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: isActive ? 'rgba(77, 181, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: isActive ? '1px solid rgba(77, 181, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isActive ? 'rgba(77, 181, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = isActive ? 'rgba(77, 181, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isActive ? 'rgba(77, 181, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = isActive ? 'rgba(77, 181, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                          }}
                        >
                          {isActive ? (
                            <Eye size={14} weight="duotone" style={{ color: '#4DB5FF' }} />
                          ) : (
                            <EyeSlash size={14} weight="duotone" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Category info */}
                    <div className="flex flex-col">
                      <p className="font-semibold text-white mb-1" style={{ fontFamily: '"Inter", sans-serif' }}>
                        {category.name}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        {category.icon || 'Money'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingCategory(null);
        }}
        onConfirm={confirmDeleteCategory}
        categoryName={deletingCategory?.name || ''}
        hasTransactions={deleteHasTransactions}
        transactionCount={deleteTransactionCount}
      />

      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCategory}
      />

      {/* FAB Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center z-40"
        style={{
          background: "linear-gradient(135deg, #7B5CFF 0%, #4DB5FF 100%)",
          boxShadow: "0 8px 32px -8px rgba(123, 92, 255, 0.6)",
        }}
      >
        <Plus size={32} weight="bold" style={{ color: "#fff" }} />
      </motion.button>

      {/* Help Button */}
      <HelpButton page="categories" />
    </div>
  );
}
