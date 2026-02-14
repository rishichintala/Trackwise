const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIncomes() {
    try {
        const incomes = await prisma.income.findMany();
        console.log("--- All Incomes ---");
        console.log(JSON.stringify(incomes, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkIncomes();
