'use client';

import { useState } from 'react';
import { testFirebaseConnection, createTestUser, testLogin } from '@/firebase/test-connection';

export default function TestFirebasePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    const result = await testFirebaseConnection();
    setResult(result);
    setLoading(false);
  };

  const handleCreateUser = async () => {
    setLoading(true);
    const result = await createTestUser('test@iso9001.com', 'test123');
    setResult(result);
    setLoading(false);
  };

  const handleTestLogin = async () => {
    setLoading(true);
    const result = await testLogin('test@iso9001.com', 'test123');
    setResult(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Prueba de Conexión Firebase
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Probando...' : 'Probar Conexión'}
          </button>
          
          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
          
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Probando...' : 'Probar Login'}
          </button>
        </div>

        {result && (
          <div className={`p-6 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Éxito' : '❌ Error'}
            </h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message || result.error}
            </p>
            {result.user && (
              <div className="mt-4 p-4 bg-white rounded border">
                <h4 className="font-semibold">Usuario:</h4>
                <p>Email: {result.user.email}</p>
                <p>UID: {result.user.uid}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Instrucciones:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Primero haz clic en "Probar Conexión"</li>
            <li>Si funciona, haz clic en "Crear Usuario"</li>
            <li>Finalmente, prueba el "Login"</li>
            <li>Si todo funciona, ve a <a href="/login" className="text-blue-600 underline">/login</a> para probar el sistema</li>
          </ol>
        </div>
      </div>
    </div>
  );
}




