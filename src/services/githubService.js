const GITHUB_API_URL = 'https://api.github.com';

const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

export async function fetchRepos(token) {
  if (!token) return [];
  const res = await fetch(`${GITHUB_API_URL}/user/repos?sort=updated&per_page=100`, {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Error al obtener repositorios. Verifica que el token sea válido.');
  }
  return res.json();
}

/**
 * Crea un nuevo repositorio.
 */
export async function createRepo(token, name, description = 'Proyecto exportado desde Espacio Educa') {
  const res = await fetch(`${GITHUB_API_URL}/user/repos`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      name,
      description,
      private: false,
      auto_init: true, // Inicializa con un README para que exista la rama main
    }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al crear el repositorio');
  }
  return res.json();
}

/**
 * Sube múltiples archivos en un solo commit usando la Git Database API.
 */
export async function pushFiles(token, owner, repo, files) {
  const headers = getHeaders(token);

  // 1. Obtener la referencia de la rama principal (main o master)
  let refRes = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/refs/heads/main`, { headers });
  if (!refRes.ok) {
    // Intentar con master si main no existe
    refRes = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/refs/heads/master`, { headers });
  }
  if (!refRes.ok) throw new Error('No se pudo encontrar la rama principal del repositorio.');
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;
  const branchRef = refData.ref;

  // 2. Obtener el commit actual para sacar el base_tree
  const commitRes = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 3. Crear el nuevo árbol con los archivos
  const tree = files.map((file) => ({
    path: file.path,
    mode: '100644', // Archivo regular
    type: 'blob',
    content: file.content,
  }));

  const treeRes = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  });
  const treeData = await treeRes.json();
  const newTreeSha = treeData.sha;

  // 4. Crear el nuevo commit
  const newCommitRes = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: 'Exportado desde Espacio Educa 🚀',
      tree: newTreeSha,
      parents: [latestCommitSha],
    }),
  });
  const newCommitData = await newCommitRes.json();
  const newCommitSha = newCommitData.sha;

  // 5. Actualizar la referencia de la rama para que apunte al nuevo commit
  const updateRefRes = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/${branchRef}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ sha: newCommitSha }),
  });

  if (!updateRefRes.ok) {
    throw new Error('Error al actualizar la rama con el nuevo código.');
  }

  return newCommitData;
}
