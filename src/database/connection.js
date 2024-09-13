import sql from 'mssql';

const dbSettings = {
    user: "sa",
    password: "Acronym_2015",
    server: "localhost",
    database: "EmissorFiscal",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.error(error);
    }
}