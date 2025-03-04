import React from "react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

interface AgregarNuevoButtonProps {
  onClick: () => void;
}

export default function AgregarNuevoButton({ onClick }: AgregarNuevoButtonProps) {
  return (
    <Button color="primary" endContent={<Plus />} onClick={onClick}>
      Agregar Nuevo
    </Button>
  );
}
