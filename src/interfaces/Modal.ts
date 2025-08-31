
export interface ModalProps {
  id: any;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  onDelete: (id: number) => void;
  apiKey: any;
  type: string;
}