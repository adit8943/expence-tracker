export const categoryDefaults = { income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'], expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment'] };
export const createEmptyTransaction = () => ({ title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '' });
