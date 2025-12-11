import useSWR from 'swr';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  createdAt: Date;
}

interface IncomeCategory extends Category {
  isLoanRepayment: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook za expense kategorije
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    '/api/categories',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    categories: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook za income kategorije
export function useIncomeCategories() {
  const { data, error, isLoading, mutate } = useSWR<IncomeCategory[]>(
    '/api/income-categories',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    incomeCategories: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// API funkcije za CRUD operacije

// Create expense category
export async function createCategory(data: {
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}) {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Greška pri kreiranju kategorije');
  }

  return response.json();
}

// Create income category
export async function createIncomeCategory(data: {
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  isLoanRepayment?: boolean;
}) {
  const response = await fetch('/api/income-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Greška pri kreiranju kategorije');
  }

  return response.json();
}

// Update expense category
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
  }
) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('updateCategory error response:', error);
    throw new Error(error.error || 'Greška pri ažuriranju kategorije');
  }

  return response.json();
}

// Update income category
export async function updateIncomeCategory(
  id: string,
  data: {
    name?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
  }
) {
  const response = await fetch(`/api/income-categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Greška pri ažuriranju kategorije');
  }

  return response.json();
}

// Delete expense category
export async function deleteCategory(id: string) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Greška pri brisanju kategorije');
  }

  return response.json();
}

// Delete income category
export async function deleteIncomeCategory(id: string) {
  const response = await fetch(`/api/income-categories/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Greška pri brisanju kategorije');
  }

  return response.json();
}

// Check if category has transactions
export async function checkCategoryUsage(id: string, type: 'expense' | 'income') {
  const endpoint = type === 'expense'
    ? `/api/categories/${id}/check`
    : `/api/income-categories/${id}/check`;
    
  const response = await fetch(endpoint);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Greška pri provjeri kategorije');
  }

  return response.json();
}
