
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";

interface PeopleSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function PeopleSelect({ value, onChange, placeholder = "Selecione uma pessoa" }: PeopleSelectProps) {
  const { people } = useSupabasePeople();

  return (
    <Select 
      value={value || "all"} 
      onValueChange={(newValue) => onChange(newValue === "all" ? undefined : newValue)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {people.map((person) => (
          <SelectItem key={person.id} value={person.id}>
            {person.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
