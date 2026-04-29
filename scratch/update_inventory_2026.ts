import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando atualização de estoque via script 2026...");

  const updates = [
    // Image 1 - NISSAN / FROTA / etc
    { codigo: "BRPRT 70262", quantidade: 2 },
    { codigo: "BRPRT 11403", quantidade: 251 },
    { codigo: "BRPRT 11409", quantidade: 167 },
    { codigo: "99098xA0A", quantidade: 950 },
    { codigo: "99099xA0A", quantidade: 800 },
    { codigo: "BRPRT 11552", quantidade: 1500 },
    { codigo: "BRPRT 11551", quantidade: 3500 },
    { codigo: "BRPRT 11404", quantidade: 68 },
    { codigo: "BRPRT 11130", quantidade: 30 },
    { codigo: "NISS06", quantidade: 0 },
    { codigo: "BRPRT 11255", quantidade: 1 },
    { codigo: "BRPRT 11259", quantidade: 458 },
    { codigo: "BRPRT 11273", quantidade: 9 },
    { codigo: "BRPRT 11273 NG", quantidade: 3 },
    { codigo: "NISS01", quantidade: 0 },
    { codigo: "BRPRT 70270", quantidade: 0 },
    { codigo: "BRPRT 70229", quantidade: 0 },
    { codigo: "BRPRT 70227", quantidade: 0 },
    { codigo: "BR01031578L", quantidade: 0 },
    { codigo: "NISS02", quantidade: 0 },
    { codigo: "BRPRT 11131", quantidade: 35 },
    { codigo: "BRPRT 11562", quantidade: 4 },
    { codigo: "63810-6MV0C", quantidade: 84 },
    { codigo: "BRPRT 50234", quantidade: 0 },
    { codigo: "BRPRT 11555", quantidade: 1 },
    { codigo: "BRPRT 11555 NG", quantidade: 2 },
    { codigo: "NISS03", quantidade: 0 },
    { codigo: "BRPRT 70263", quantidade: 0 },
    { codigo: "63810-6MV0A", quantidade: 61 },
    { codigo: "63810-6MV0A NG", quantidade: 2 },
    { codigo: "63811-6MV0A", quantidade: 63 },
    { codigo: "63811-6MV0A NG", quantidade: 2 },
    { codigo: "63810-6MV0B", quantidade: 11 },
    { codigo: "63811-6MV0B", quantidade: 14 },
    { codigo: "63811-6MV0B NG", quantidade: 1 },
    { codigo: "93828-6MV0A", quantidade: 12 },
    { codigo: "93828-6MV0A NG", quantidade: 2 },
    { codigo: "93829-6MV0A", quantidade: 24 },
    { codigo: "93829-6MV0A NG", quantidade: 0 },
    { codigo: "990795JJ0A", quantidade: 0 },
    { codigo: "BRPRT 11588", quantidade: 4 },
    { codigo: "NISS04", quantidade: 0 },
    { codigo: "FRONTIER", quantidade: 1800 },
    { codigo: "NISS05", quantidade: 200 },
    { codigo: "BRPRT 11357", quantidade: 0 },
    { codigo: "BRPRT 11156", quantidade: 0 },
    { codigo: "BRPRT 11359", quantidade: 9 },
    { codigo: "k000453", quantidade: 47 },
    { codigo: "KE7455500B", quantidade: 0 },
    { codigo: "BRPRT 11055", quantidade: 273 },
    { codigo: "BRPRT 10753", quantidade: 140 },
    { codigo: "BRPRT 10947", quantidade: 464 },
    { codigo: "BRPRT 11326", quantidade: 14 },
    { codigo: "BRPRT 11325", quantidade: 36 },
    { codigo: "BRPRT 11355", quantidade: 4 },
    { codigo: "BRPRT 11354", quantidade: 7 },
    { codigo: "BRPRT 70257", quantidade: 334 },
    { codigo: "990799LH1A", quantidade: 0 },
    { codigo: "R100362098", quantidade: 0 },
    { codigo: "BRPRT 11605", quantidade: 872 },
    { codigo: "BRPRT 11604", quantidade: 1165 },
    { codigo: "BRPRT 11607", quantidade: 1105 },
    { codigo: "BRPRT 11608", quantidade: 1114 },
    { codigo: "BRPRT 3110100001", quantidade: 2175 },
    { codigo: "BRPRT 11603", quantidade: 1508 },
    { codigo: "99098xA0A NG", quantidade: 5 },
    { codigo: "99099xA0A NG", quantidade: 0 },
    { codigo: "NISSAN004", quantidade: 0 },
    { codigo: "BRPRT 11208", quantidade: 0 },
    { codigo: "T99E25MP0A", quantidade: 0 },
    { codigo: "BRPRT11609", quantidade: 2018 },
    { codigo: "K000665", quantidade: 16 },
    { codigo: "TEST002", quantidade: 20 },
    { codigo: "BRPRT 11591", quantidade: 1 },
    { codigo: "BRPRT 11566", quantidade: 37 },
    { codigo: "EL300BT", quantidade: 14 },
    { codigo: "BRPRT 11605 NG", quantidade: 36 },
    { codigo: "BRPRT 11604 NG", quantidade: 59 },
    { codigo: "BRPRT 11607 NG", quantidade: 57 },
    { codigo: "BRPRT 11608 NG", quantidade: 14 },
    { codigo: "BRPRT 3110100001 NG", quantidade: 16 },
    { codigo: "BRPRT 11603 NG", quantidade: 18 },
    { codigo: "NISSAN004 NG", quantidade: 0 },
    { codigo: "BRPRT11609 NG", quantidade: 0 },
    { codigo: "K000665 NG", quantidade: 0 },
    { codigo: "TEST002 NG", quantidade: 0 },
    { codigo: "BRPRT 11591 NG", quantidade: 0 },

    // Image 2 - BARIGUI / LOCALIZA / MOVIDA / SESE / UNIDAS
    { codigo: "BRG01", quantidade: 0 },
    { codigo: "LOCAM4", quantidade: 0 },
    { codigo: "LOCAM7", quantidade: 0 },
    { codigo: "LOCAM6", quantidade: 0 },
    { codigo: "LOCAM9", quantidade: 0 },
    { codigo: "LOCAM8", quantidade: 0 },
    { codigo: "LOCAM5", quantidade: 0 },
    { codigo: "LOCAM1", quantidade: 0 },
    { codigo: "LOCAM2", quantidade: 0 },
    { codigo: "LOCAM3", quantidade: 0 },
    { codigo: "LOC01", quantidade: 0 },
    { codigo: "LOC02", quantidade: 0 },
    { codigo: "LOC03", quantidade: 0 },
    { codigo: "LOC04", quantidade: 0 },
    { codigo: "LOC05", quantidade: 8 },
    { codigo: "LOC06", quantidade: 18 },
    { codigo: "LOC07", quantidade: 8 },
    { codigo: "LOC08", quantidade: 8 },
    { codigo: "LOC09", quantidade: 150 },
    { codigo: "LOC010", quantidade: 46 },
    { codigo: "LOC012", quantidade: 0 },
    { codigo: "LOC013", quantidade: 0 },
    { codigo: "LOC014", quantidade: 5 },
    { codigo: "LOC015", quantidade: 0 },
    { codigo: "LOC016", quantidade: 0 },
    { codigo: "LOC018", quantidade: 0 },
    { codigo: "LOC017", quantidade: 551 },
    { codigo: "MOV01", quantidade: 1 },
    { codigo: "MOV02", quantidade: 0 },
    { codigo: "MOV03", quantidade: 48 },
    { codigo: "MOV04", quantidade: 1900 },
    { codigo: "MOV05", quantidade: 4094 },
    { codigo: "MOV06", quantidade: 2162 },
    { codigo: "MOV07", quantidade: 736 },
    { codigo: "MOV08", quantidade: 4600 },
    { codigo: "MOV09", quantidade: 1427 },
    { codigo: "MOV10", quantidade: 7585 },
    { codigo: "MOV11", quantidade: 3418 },
    { codigo: "MOV12", quantidade: 0 },
    { codigo: "MOV13", quantidade: 920 },
    { codigo: "SESE01", quantidade: 10 },
    { codigo: "SESE02", quantidade: 10 },
    { codigo: "SESE03", quantidade: 35 },
    { codigo: "SESE04", quantidade: 0 },
    { codigo: "SESE05", quantidade: 10 },
    { codigo: "SESE06", quantidade: 3 },
    { codigo: "SESE07", quantidade: 1 },
    { codigo: "SESE09", quantidade: 7 },
    { codigo: "SESE08", quantidade: 6 },
    { codigo: "SESE10", quantidade: 4 },
    { codigo: "SESE11", quantidade: 8 },
    { codigo: "UNI01", quantidade: 225 },
    { codigo: "UNI02", quantidade: 241 },
    { codigo: "UNI03", quantidade: 230 },
    { codigo: "UNI04", quantidade: 233 },
    { codigo: "UNI05", quantidade: 1 },
    { codigo: "LOC019", quantidade: 519 },
    { codigo: "MOV14", quantidade: 900 },
  ];

  let totalUpdated = 0;
  for (const update of updates) {
    const product = await prisma.product.update({
      where: { codigo: update.codigo },
      data: { quantidade: update.quantidade },
    }).catch(err => {
      console.warn(`⚠️ Produto não encontrado ou erro ao atualizar: ${update.codigo}`);
      return null;
    });

    if (product) {
      totalUpdated++;
    }
  }

  console.log(`\n✅ Atualização concluída! ${totalUpdated} produtos atualizados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
