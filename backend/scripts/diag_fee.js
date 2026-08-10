const { BeltExam, BeltExamParticipant, Member, FinancialAccount, FinancialTransaction } = require('./src/models');

async function check() {
    try {
        const exam = await BeltExam.findOne({
            where: { examName: '2026 YILI KARATE BRANŞI-DÖNEM-1 SINAVI' }
        });
        if (!exam) {
            console.log('Exam not found');
            process.exit(0);
        }
        console.log('--- EXAM ---');
        console.log(JSON.stringify(exam, null, 2));

        const participants = await BeltExamParticipant.findAll({
            where: { examId: exam.id },
            include: [{ model: Member, as: 'member' }]
        });
        console.log('--- PARTICIPANTS ---');
        console.log(JSON.stringify(participants, null, 2));

        for (const p of participants) {
            const account = await FinancialAccount.findOne({
                where: { entityType: 'MEMBER', entityId: p.memberId }
            });
            console.log(`--- ACCOUNT for ${p.member?.fullName} ---`);
            console.log(JSON.stringify(account, null, 2));

            const txs = await FinancialTransaction.findAll({
                where: { financialAccountId: account?.id }
            });
            console.log(`--- TRANSACTIONS for ${p.member?.fullName} ---`);
            console.log(JSON.stringify(txs, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
