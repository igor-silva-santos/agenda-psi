(async () => {
  try {
    const { default: fetch } = await import('node-fetch');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kutzzoxycekaiziuvmis.supabase.co';

    console.log(`Tentando acessar a URL: ${url}`);

    const response = await fetch(url);

    console.log('Status da resposta:', response.status);
    if (response.ok) {
      console.log('Conexão bem-sucedida!');
      const body = await response.text();
      console.log('Corpo da resposta (parcial):', body.substring(0, 200));
    } else {
      console.error('Erro na conexão:', response.statusText);
      const errorBody = await response.text();
      console.error('Corpo do erro:', errorBody);
      throw new Error(`Falha na requisição com status: ${response.status}`);
    }
  } catch (err) {
    console.error('Erro ao tentar conectar:', err);
  }
})();
