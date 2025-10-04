import { useState, useEffect } from "react";
import { Medicine, MedicineFormData } from "@/types/medicine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MedicineFormProps {
  medicine?: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicineFormData) => void;
}

const MedicineForm = ({ medicine, isOpen, onClose, onSubmit }: MedicineFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<MedicineFormData>({
    name: "",
    stock: 0,
    price: 0,
    expiryDate: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        stock: medicine.stock,
        price: medicine.price,
        expiryDate: medicine.expiryDate,
        category: medicine.category || "",
        description: medicine.description || "",
      });
    } else {
      setFormData({
        name: "",
        stock: 0,
        price: 0,
        expiryDate: "",
        category: "",
        description: "",
      });
    }
  }, [medicine, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do medicamento é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (formData.stock < 0) {
      toast({
        title: "Erro",
        description: "Estoque não pode ser negativo",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Erro",
        description: "Preço deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (!formData.expiryDate) {
      toast({
        title: "Erro",
        description: "Data de validade é obrigatória",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    onClose();
    toast({
      title: "Sucesso",
      description: medicine ? "Medicamento atualizado com sucesso!" : "Medicamento adicionado com sucesso!",
    });
  };

  const handleChange = (field: keyof MedicineFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-primary">
            {medicine ? "Editar Medicamento" : "Adicionar Medicamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Medicamento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Paracetamol 500mg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Data de Validade *</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Ex: Analgésico, Antibiótico"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição opcional do medicamento"
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-pharmacy-primary hover:bg-pharmacy-primary-hover text-white"
            >
              {medicine ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineForm;