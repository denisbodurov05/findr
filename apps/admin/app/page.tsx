"use client";

import { EditorHeader } from "@/components/EditorHeader";
import { GridEditor } from "@/components/GridEditor";
import { LoginForm } from "@/components/LoginForm";
import { ProductSidebar } from "@/components/ProductSidebar";
import { useAdminEditor } from "@/features/editor/useAdminEditor";
import { GRID_COLS, GRID_ROWS } from "@/lib/map";

export default function AdminPage() {
  const editor = useAdminEditor();

  if (!editor.authReady) return null;

  if (!editor.signedIn) {
    return (
      <LoginForm
        email={editor.email}
        password={editor.password}
        authError={editor.authError}
        authBusy={editor.authBusy}
        onEmailChange={editor.setEmail}
        onPasswordChange={editor.setPassword}
        onSubmit={editor.handleLogin}
      />
    );
  }

  if (editor.role === null || !editor.isAdmin) return null;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <EditorHeader
        stores={editor.stores}
        storeId={editor.storeId}
        onStoreChange={editor.handleStoreChange}
        isAdmin={editor.isAdmin}
        busy={editor.saving || editor.loadingStore}
        addingStore={editor.addingStore}
        newStoreName={editor.newStoreName}
        onNewStoreNameChange={editor.setNewStoreName}
        onNewStoreSubmit={editor.handleCreateStore}
        onCancelNewStore={() => {
          editor.setAddingStore(false);
          editor.setNewStoreName("");
        }}
        onStartNewStore={() => editor.setAddingStore(true)}
        onLogout={editor.handleLogout}
      />

      {editor.status ? (
        <div
          aria-live="polite"
          className={`px-6 py-2 text-sm ${
            editor.status.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {editor.status.text}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-6 overflow-hidden p-6">
        <ProductSidebar
          tool={editor.tool}
          selectedProduct={editor.selectedProduct}
          search={editor.search}
          productList={editor.productList}
          onSelectTool={editor.selectTool}
          onSelectProduct={editor.setSelectedProduct}
          onSearchChange={editor.setSearch}
        />

        <GridEditor
          cells={editor.cells}
          gridCols={GRID_COLS}
          gridRows={GRID_ROWS}
          isAdmin={editor.isAdmin}
          saving={editor.saving}
          loading={editor.loadingStore}
          dirty={editor.dirty}
          productCategory={editor.productCategory}
          onPointerDown={editor.handleCellPointerDown}
          onPointerEnter={editor.handleCellPointerEnter}
          onSave={editor.handleSave}
          onReload={editor.handleReload}
          onDelete={editor.handleDeleteStore}
        />
      </div>
    </main>
  );
}
