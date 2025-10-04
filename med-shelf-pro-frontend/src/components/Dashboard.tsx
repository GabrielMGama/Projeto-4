import { useEffect, useMemo, useState } from "react";
import { Medicine, MedicineFormData } from "@/types/medicine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import MedicineCard from "./MedicineCard";
import MedicineForm from "./MedicineForm";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api"; // <— usa a API do backend

const Dashboard = () => {
  const { toast } = useToast();

  // estado vindo do BACKEND (não mais mock local)
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // carrega do backend
  const load = async (q?: string) => {
    try {
      const data = await api.list(q);
      // a API retorna { items, total, ... }
      const mapped: Medicine[] = (data.items || []).map((row: any) => ({
        id: String(row.id),
        name: row.name,
        // mapeamento para o tipo do front:
        stock: Number(row.quantity ?? 0),
        // não existe coluna price/category — guardamos em notes por ora
        price: Number(row.price ?? 0), // ficará 0 se não houver coluna/valor
        expiryDate: row.expires_at ?? "",
        category: row.category ?? "",   // idem
        description: row.notes ?? "",   // aproveita notes como descrição
      }));
      setMedicines(mapped);
    } catch (e: any) {
      toast({
        title: "Erro ao carregar",
        description: e.message || "Não foi possível carregar os medicamentos.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    load(); // carrega ao montar
  }, []);

  // busca client-side (você pode trocar para server-side chamando load(searchTerm))
  const filteredMedicines = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.category || "").toLowerCase().includes(term)
    );
  }, [medicines, searchTerm]);

  const openEditForm = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingMedicine(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMedicine(null);
  };

  // CREATE -> chama API e recarrega
  const handleAddMedicine = async (data: MedicineFormData) => {
    try {
      await api.create({
        name: data.name,
        // campos existentes no schema atual:
        quantity: Number(data.stock ?? 0),
        expires_at: data.expiryDate || null,
        // sem colunas específicas para price/category — guardamos em notes:
        notes: data.description || null,
        // se você criou colunas novas no DB, inclua aqui: price, category, brand, dosage, lot...
      });
      toast({ title: "Sucesso", description: "Medicamento adicionado." });
      closeForm();
      await load();
    } catch (e: any) {
      toast({
        title: "Erro ao adicionar",
        description: e.message || "Não foi possível salvar.",
        variant: "destructive",
      });
    }
  };

  // UPDATE -> chama API e recarrega
  const handleEditMedicine = async (data: MedicineFormData) => {
    if (!editingMedicine) return;
    try {
      await api.update(Number(editingMedicine.id), {
        name: data.name,
        quantity: Number(data.stock ?? 0),
        expires_at: data.expiryDate || null,
        notes: data.description || null,
      });
      toast({ title: "Sucesso", description: "Medicamento atualizado." });
      closeForm();
      await load();
    } catch (e: any) {
      toast({
        title: "Erro ao atualizar",
        description: e.message || "Não foi possível atualizar.",
        variant: "destructive",
      });
    }
  };

  // DELETE -> chama API e recarrega
  const handleDeleteMedicine = async (id: string) => {
    try {
      await api.remove(Number(id));
      toast({ title: "Medicamento removido", description: "Remoção realizada." });
      await load();
    } catch (e: any) {
      toast({
        title: "Erro ao remover",
        description: e.message || "Não foi possível remover.",
        variant: "destructive",
      });
    }
  };

  const lowStockCount = filteredMedicines.filter((m) => m.stock <= 5).length;
  const expiringSoonCount = filteredMedicines.filter((m) => {
    const d = m.expiryDate ? new Date(m.expiryDate) : null;
    if (!d) return false;
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return d <= in30;
  }).length;

  return (
    <div className="min-h-screen bg-pharmacy-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">Total de Medicamentos</h3>
            <p className="text-3xl font-bold text-pharmacy-primary">{filteredMedicines.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">Estoque Baixo</h3>
            <p className="text-3xl font-bold text-warning">{lowStockCount}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">Vencendo em 30 dias</h3>
            <p className="text-3xl font-bold text-danger">{expiringSoonCount}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <Button onClick={openAddForm} className="bg-success hover:bg-success/90 text-white" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Adicionar
          </Button>

          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar medicamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline" className="bg-primary text-white hover:bg-primary/90 border-none">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onEdit={openEditForm}
              onDelete={handleDeleteMedicine}
            />
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchTerm ? "Nenhum medicamento encontrado." : "Nenhum medicamento cadastrado."}
            </p>
          </div>
        )}

        {/* Form Modal */}
        <MedicineForm
          medicine={editingMedicine}
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={editingMedicine ? handleEditMedicine : handleAddMedicine}
        />
      </div>
    </div>
  );
};

export default Dashboard;
