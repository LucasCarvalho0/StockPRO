import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized, serverError } from '@/lib/auth';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  headers();
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const products = await prisma.product.findMany({
      where: { ativo: true, quantidadeNG: { gt: 0 } },
      include: { supplier: { select: { nome: true } } },
      orderBy: { nome: 'asc' },
    });

    const now = new Date();
    const labelDate = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const labelTime = String(now.getHours()).padStart(2, '0') + '-' + String(now.getMinutes()).padStart(2, '0');
    const filename = `posicao_sucata_ng_${labelDate}_${labelTime}.xlsx`;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'StockPRO';
    const sheet = workbook.addWorksheet('Sucata (NG)');

    // Cabeçalho Principal
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'STOCKPRO — RELATÓRIO DE SUCATA (NG)';
    titleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } }; // Red header
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 25;

    sheet.columns = [
      { header: 'CÓDIGO', key: 'codigo', width: 15 },
      { header: 'PRODUTO', key: 'nome', width: 40 },
      { header: 'FORNECEDOR', key: 'fornecedor', width: 25 },
      { header: 'QTD INTACTA', key: 'quantidade_boa', width: 15 },
      { header: 'QTD NG (SUCATA)', key: 'quantidade_ng', width: 20 },
      { header: 'UNIDADE', key: 'unidade', width: 12 },
      { header: 'STATUS', key: 'status', width: 15 },
    ];

    sheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(2).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
      cell.alignment = { horizontal: 'center' };
    });

    for (const p of products) {
      const row = sheet.addRow({
        codigo: p.codigo,
        nome: p.nome,
        fornecedor: p.supplier?.nome ?? 'S/ FORNECEDOR',
        quantidade_boa: p.quantidade,
        quantidade_ng: p.quantidadeNG,
        unidade: p.unidade,
        status: 'AVARIADO',
      });

      row.eachCell((cell) => {
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
          cell.alignment = { vertical: 'middle' };
      });

      row.getCell('quantidade_ng').font = { color: { argb: 'FFDC2626' }, bold: true };
      row.getCell('quantidade_ng').alignment = { horizontal: 'center' };
      row.getCell('status').font = { color: { argb: 'FFDC2626' }, bold: true };
      row.getCell('status').alignment = { horizontal: 'center' };
    }

    sheet.addRow([]);
    const footer = sheet.addRow([`Relatório gerado em ${now.toLocaleString('pt-BR')} — StockPRO Gestão de Ativos`]);
    footer.font = { italic: true, size: 8, color: { argb: 'FF64748B' } };
    sheet.mergeCells(footer.number, 1, footer.number, 7);

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return serverError();
  }
}

export const dynamic = 'force-dynamic';
