import { prisma } from "../src/services/prisma";
import { ensureAdminSeed } from "../src/services/users";

async function main() {
  const admin = await ensureAdminSeed();
  console.log(`✔ Administrador listo: ${admin.username} (rol: ${admin.role})`);
}

main()
  .catch((error) => {
    console.error("Error al ejecutar el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
