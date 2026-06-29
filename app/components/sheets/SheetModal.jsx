'use client';

import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Button } from '../ui/Button';
import api from '@/lib/api';

/**
 * SheetModal
 *
 * mode: 'create' | 'edit' | 'view'
 * - create: blank name + editor
 * - edit:   prefilled name + editor (editable)
 * - view:   read-only render of the sheet
 *
 * Guards unsaved changes: closing with a dirty editor pops a
 * "Save changes?" confirmation (Save / Discard / Cancel).
 */
export default function SheetModal({ mode = 'create', sheet, onClose, onSaved }) {
  const isView = mode === 'view';

  const [name, setName] = useState(sheet?.name || '');
  const [content, setContent] = useState(sheet?.content || '');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Keep local state in sync if a different sheet is opened
  useEffect(() => {
    setName(sheet?.name || '');
    setContent(sheet?.content || '');
    setDirty(false);
    setError('');
    setShowConfirm(false);
  }, [sheet, mode]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setDirty(true);
  };

  const handleContentChange = (value) => {
    setContent(value);
    setDirty(true);
  };

  // Attempt to close — guard unsaved changes
  const attemptClose = () => {
    if (!isView && dirty) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a file name');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let response;
      if (mode === 'edit' && sheet?._id) {
        response = await api.sheets.update(sheet._id, {
          name: name.trim(),
          content,
        });
      } else {
        response = await api.sheets.create({ name: name.trim(), content });
      }

      if (response.success) {
        setDirty(false);
        onSaved?.(response.data);
        onClose();
      } else {
        setError(response.message || 'Failed to save sheet');
      }
    } catch (err) {
      console.error('Save sheet error:', err);
      setError(err.message || 'Failed to save sheet');
    } finally {
      setSaving(false);
    }
  };

  const title =
    mode === 'create'
      ? 'New Sheet'
      : mode === 'edit'
      ? 'Edit Sheet'
      : sheet?.name || 'Sheet';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h3 className="text-white text-lg font-semibold truncate pr-4">
            {title}
          </h3>
          <button
            onClick={attemptClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* File name */}
          {isView ? (
            <p className="text-gray-300 text-sm mb-4">
              <span className="text-gray-500">File name: </span>
              {sheet?.name}
            </p>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">
                File name
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter a file name..."
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Editor / viewer */}
          {isView ? (
            <div
              className="ql-snow bg-black rounded-lg p-4 border border-gray-800 text-gray-100 min-h-[200px]"
            >
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{
                  __html: content || '<p class="text-gray-500">Empty sheet</p>',
                }}
              />
            </div>
          ) : (
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleContentChange}
              className="bg-black rounded-lg text-white"
              placeholder="Write your sheet..."
            />
          )}

          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={attemptClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isView ? 'Close' : 'Cancel'}
          </Button>
          {!isView && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Unsaved-changes confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-800 p-6">
            <h4 className="text-white text-lg font-semibold mb-2">
              Save changes?
            </h4>
            <p className="text-gray-400 text-sm mb-6">
              You have unsaved changes. Do you want to save them before closing?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  onClose();
                }}
                className="border-gray-700 text-gray-200 hover:bg-gray-800"
              >
                Discard
              </Button>
              <Button
                onClick={() => {
                  setShowConfirm(false);
                  handleSave();
                }}
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
