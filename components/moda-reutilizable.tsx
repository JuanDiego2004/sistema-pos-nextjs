// components/ReusableModal.tsx
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

interface ReusableModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function usarModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return { isOpen, onOpen, onClose: onOpenChange };
}

export default function ModalReutilizable({
  title,
  children,
  isOpen,
  onClose,
}: ReusableModalProps) {
  return (
    <Modal size="5xl" isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}