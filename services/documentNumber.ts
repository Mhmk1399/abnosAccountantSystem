export const generateNextDocumentNumber = async (): Promise<string> => {
  try {
    const response = await fetch('/api/dailyBook');
    const data = await response.json();
    const dailyBooks = data.dailyBooks || [];
    const nextNumber = dailyBooks.length + 1;
    return nextNumber.toString();
  } catch (error) {
    console.error('Error generating document number:', error);
    return '1';
  }
};