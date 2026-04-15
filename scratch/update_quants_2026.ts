import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const data = [
  { codigo: 'BRPRT 70262', quantidade: 2 },
  { codigo: 'BRPRT 11403', quantidade: 251 },
  { codigo: 'BRPRT 11409', quantidade: 167 },
  { codigo: '99098xA0A', quantidade: 1350 },
  { codigo: '99099xA0A', quantidade: 1200 },
  { codigo: 'BRPRT 11552', quantidade: 2700 },
  { codigo: 'BRPRT 11551', quantidade: 5000 },
  { codigo: 'BRPRT 11404', quantidade: 68 },
  { codigo: 'BRPRT 11130', quantidade: 30 },
  { codigo: 'NISS06', quantidade: 0 },
  { codigo: 'BRPRT 11255', quantidade: 1 },
  { codigo: 'BRPRT 11259', quantidade: 458 },
  { codigo: 'BRPRT 11273', quantidade: 9 },
  { codigo: 'BRPRT 11273 NG', quantidade: 3 },
  { codigo: 'NISS01', quantidade: 0 },
  { codigo: 'BRPRT 70270', quantidade: 0 },
  { codigo: 'BRPRT 70229', quantidade: 0 },
  { codigo: 'BRPRT 70227', quantidade: 0 },
  { codigo: 'BR01031578L', quantidade: 0 },
  { codigo: 'NISS02', quantidade: 0 },
  { codigo: 'BRPRT 11131', quantidade: 35 },
  { codigo: 'BRPRT 11562', quantidade: 4 },
  { codigo: '63810-6MV0C', quantidade: 84 },
  { codigo: 'BRPRT 50234', quantidade: 0 },
  { codigo: 'BRPRT 11555', quantidade: 1 },
  { codigo: 'BRPRT 11555 NG', quantidade: 2 },
  { codigo: 'NISS03', quantidade: 0 },
  { codigo: 'BRPRT 70263', quantidade: 0 },
  { codigo: '63810-6MV0A', quantidade: 61 },
  { codigo: '63810-6MV0A NG', quantidade: 2 },
  { codigo: '63811-6MV0A', quantidade: 63 },
  { codigo: '63811-6MV0A NG', quantidade: 2 },
  { codigo: '63810-6MV0B', quantidade: 11 },
  { codigo: '63811-6MV0B', quantidade: 14 },
  { codigo: '63811-6MV0B NG', quantidade: 1 },
  { codigo: '93828-6MV0A', quantidade: 12 },
  { codigo: '93828-6MV0A NG', quantidade: 2 },
  { codigo: '93829-6MV0A', quantidade: 24 },
  { codigo: '93829-6MV0A NG', quantidade: 0 },
  { codigo: '990795JJ0A', quantidade: 0 },
  { codigo: 'BRPRT 11588', quantidade: 4 },
  { codigo: 'NISS04', quantidade: 0 },
  { codigo: 'FRONTIER', quantidade: 1800 },
  { codigo: 'NISS05', quantidade: 200 },
  { codigo: 'BRPRT 11357', quantidade: 0 },
  { codigo: 'BRPRT 11156', quantidade: 0 },
  { codigo: 'BRPRT 11359', quantidade: 14 },
  { codigo: 'K000453', quantidade: 47 },
  { codigo: 'KE7455S00B', quantidade: 0 },
  { codigo: 'BRPRT 11055', quantidade: 140 },
  { codigo: 'BRPRT 10753', quantidade: 339 },
  { codigo: 'BRPRT 10947', quantidade: 76 },
  { codigo: 'BRPRT 11326', quantidade: 14 },
  { codigo: 'BRPRT 11325', quantidade: 36 },
  { codigo: 'BRPRT 11369', quantidade: 4 }, /* Trava de Estepe */
  { codigo: 'BRPRT 11354', quantidade: 11 },
  { codigo: 'BRPRT 70257', quantidade: 334 },
  { codigo: '990799LH1A', quantidade: 0 },
  { codigo: 'R100362098', quantidade: 0 },
  { codigo: 'BRPRT 11605', quantidade: 610 },
  { codigo: 'BRPRT 11604', quantidade: 686 },
  { codigo: 'BRPRT 11607', quantidade: 475 },
  { codigo: 'BRPRT 11608', quantidade: 301 },
  { codigo: 'BRPRT 3110100001', quantidade: 761 },
  { codigo: 'BRPRT 11603', quantidade: 416 },
  { codigo: '99098xA0A NG', quantidade: 5 },
  { codigo: '99099xA0A NG', quantidade: 0 },
  { codigo: 'NISSAN004', quantidade: 0 },
  { codigo: 'BRPRT 11208', quantidade: 0 },
  { codigo: 'T99E25MP0A', quantidade: 0 },
  { codigo: 'BRPRT11609', quantidade: 665 },
  { codigo: 'K000665', quantidade: 16 },
  { codigo: 'TEST002', quantidade: 20 },
  { codigo: 'BRPRT 11591', quantidade: 1 },
  { codigo: 'BRPRT 11566', quantidade: 37 },
  { codigo: 'EL300BT', quantidade: 14 },
  { codigo: 'BRPRT 11605 NG', quantidade: 36 },
  { codigo: 'BRPRT 11604 NG', quantidade: 59 },
  { codigo: 'BRPRT 11607 NG', quantidade: 57 },
  { codigo: 'BRPRT 11608 NG', quantidade: 14 },
  { codigo: 'BRPRT 3110100001 NG', quantidade: 16 },
  { codigo: 'BRPRT 11603 NG', quantidade: 18 },
  { codigo: 'NISSAN004 NG', quantidade: 0 },
  { codigo: 'BRPRT11609 NG', quantidade: 0 },
  { codigo: 'K000665 NG', quantidade: 0 },
  { codigo: 'TEST002 NG', quantidade: 0 },
  { codigo: 'BRPRT 11591 NG', quantidade: 0 },
]

async function main() {
  console.log('Iniciando atualização de saldos...')
  let successCount = 0;
  let failCount = 0;
  for (const item of data) {
    try {
      const product = await prisma.product.findUnique({
        where: { codigo: item.codigo }
      });
      if (product) {
        await prisma.product.update({
          where: { codigo: item.codigo },
          data: { quantidade: item.quantidade }
        })
        successCount++;
        // console.log(`Atualizou ${item.codigo} para ${item.quantidade}`)
      } else {
        // console.log(`Não encontrou ${item.codigo}`)
        failCount++;
      }
    } catch (err) {
      console.error(`Erro ao atualizar ${item.codigo}:`, err)
      failCount++;
    }
  }
  console.log(`Conluido. Sucesso: ${successCount}, Falha (não encontrados): ${failCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
