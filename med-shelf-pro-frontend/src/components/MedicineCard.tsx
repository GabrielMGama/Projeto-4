import { Medicine } from "@/types/medicine";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Package, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
}

const MedicineCard = ({ medicine, onEdit, onDelete }: MedicineCardProps) => {
  const isLowStock = medicine.stock <= 5;
  const isExpiringSoon = new Date(medicine.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className={cn(
      "w-full max-w-sm transition-all duration-300 hover:shadow-lg",
      isLowStock && "border-warning",
      isExpiringSoon && "border-danger"
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{medicine.name}</h3>
            {medicine.category && (
              <span className="text-xs bg-pharmacy-accent text-pharmacy-primary px-2 py-1 rounded-full">
                {medicine.category}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Estoque</span>
              </div>
              <span className={cn(
                "font-semibold",
                isLowStock ? "text-warning" : "text-foreground"
              )}>
                {medicine.stock}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Preço de venda</span>
              </div>
              <span className="font-semibold text-foreground">
                R$ {medicine.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Validade</span>
              </div>
              <span className={cn(
                "text-sm font-medium",
                isExpiringSoon ? "text-danger" : "text-foreground"
              )}>
                {new Date(medicine.expiryDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(medicine)}
              className="flex-1 bg-pharmacy-primary text-white hover:bg-pharmacy-primary-hover border-none"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(medicine.id)}
              className="flex-1 bg-danger text-white hover:bg-danger/90 border-none"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Deletar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;