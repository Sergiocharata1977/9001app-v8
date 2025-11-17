'use client';

import { useState } from 'react';

export default function TestSDKPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');

  const testGet = async () => {
    if (!token.trim()) {
      setError('Please enter a token first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test/sdk', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testPost = async () => {
    if (!token.trim()) {
      setError('Please enter a token first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test/sdk', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testData: 'Hello from frontend!',
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SDK Testing Dashboard</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <h3 className="font-semibold text-yellow-900 mb-2">
          ⚠️ Configuración Requerida
        </h3>
        <p className="text-yellow-800 text-sm mb-2">
          Para probar el SDK, primero necesitas configurar Firebase Admin SDK:
        </p>
        <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
          <li>
            Agrega las credenciales de Firebase Admin SDK a tu archivo
            .env.local
          </li>
          <li>Reinicia el servidor (npm run dev)</li>
          <li>Obtén un token de Firebase Auth de un usuario autenticado</li>
          <li>Pega el token en el campo de abajo</li>
        </ol>
      </div>

      <div className="space-y-4">
        {/* Token Input */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            1. Enter Your Firebase Token
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Paste your Firebase ID token here. You can get it from your browser
            console:
          </p>
          <code className="block bg-gray-100 p-2 rounded text-xs mb-4">
            firebase.auth().currentUser.getIdToken().then(console.log)
          </code>
          <textarea
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste your Firebase token here..."
            className="w-full p-3 border border-gray-300 rounded font-mono text-xs"
            rows={4}
          />
          {token && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Token entered ({token.length} characters)
            </p>
          )}
        </div>

        {/* Test Authentication */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">2. Test Authentication</h2>
          <p className="text-sm text-gray-600 mb-4">
            Test basic authentication with withAuth middleware
          </p>
          <button
            onClick={testGet}
            disabled={loading || !token}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test GET (Auth Only)'}
          </button>
        </div>

        {/* Test Role Permission */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            3. Test Role Permission
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Test role-based access control (requires admin or gerente role)
          </p>
          <button
            onClick={testPost}
            disabled={loading || !token}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test POST (Requires Admin/Gerente)'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Este endpoint requiere rol de admin o gerente. Si falla con 403, tu
            usuario no tiene el rol correcto.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <h3 className="text-red-800 font-semibold">❌ Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && !error && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <h3 className="text-green-800 font-semibold mb-2">✅ Result:</h3>
            <pre className="bg-white p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded">
        <h3 className="text-lg font-semibold mb-3">
          📚 How to Get a Firebase Token
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Option 1: From Browser Console</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Log in to your app with a Firebase user</li>
              <li>Open browser console (F12)</li>
              <li>
                Run:{' '}
                <code className="bg-white px-1 rounded">
                  firebase.auth().currentUser.getIdToken().then(console.log)
                </code>
              </li>
              <li>Copy the token that appears</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold mb-2">
              Option 2: Configure Firebase Admin SDK
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Get your service account key from Firebase Console</li>
              <li>Add credentials to .env.local file</li>
              <li>Restart the server</li>
              <li>Use the /api/test/get-token endpoint</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
