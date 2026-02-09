"use client";

import { Button, Modal } from "@/components/atoms";
import { Form } from "@/components/molecules";
import { useState } from "react";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="min-h-screen bg-slate-900 p-6">
      <div className="flex justify-end p-6">
        <Button onClick={openModal}>New Room</Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="bg-slate-900 p-4 rounded-lg"
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-lg">Modal Title</h2>
          <button onClick={closeModal} className="text-white text-xl">
            &times; {/* Close button */}
          </button>
        </div>

        {/* Body content */}
        <div className="mt-4 text-white">

        </div>

        <div className="mt-4 flex justify-end space-x-4">
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button variant="primary">Create</Button>
        </div>
      </Modal>
    </main>
  );
}
