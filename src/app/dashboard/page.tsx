"use client";

import { Button, Input, Modal } from "@/components/atoms";
import { Form } from "@/components/molecules";
import CreateRoomForm from "@/components/organisms/createRoomForm";
import { useState } from "react";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => setIsModalOpen(false);

  const handleCreateRoom = () => {
      return 
  }

  return (
    <main className="min-h-screen bg-slate-900 p-6">
      <div className="flex justify-end p-6">
        <Button onClick={openModal}>New Room</Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        className="bg-slate-900 p-4 rounded-lg"
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-lg">Create Room</h2>
          <button onClick={closeModal} className="text-white text-xl">
            &times; {/* Close button */}
          </button>
        </div>

        {/* Body content */}
        <div className="mt-4 text-white">
          <CreateRoomForm />
        </div>


      </Modal>
    </main>
  );
}
