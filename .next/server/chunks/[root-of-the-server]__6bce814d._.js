module.exports = {

"[project]/.next-internal/server/app/api/availability/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/availability/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
];
function generateTimeSlots(start, end) {
    const slots = [];
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    const current = new Date(startTime);
    while(current < endTime){
        slots.push(current.toTimeString().slice(0, 5));
        current.setHours(current.getHours() + 1);
    }
    return slots;
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');
        if (!startDate || !endDate) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Parâmetros start e end são obrigatórios'
            }, {
                status: 400
            });
        }
        // Carregar horários de trabalho configurados (simulado, em produção buscar do Firestore)
        const workingHours = {
            monday: {
                enabled: true,
                slots: [
                    {
                        start: '09:00',
                        end: '12:00'
                    },
                    {
                        start: '14:00',
                        end: '18:00'
                    }
                ]
            },
            tuesday: {
                enabled: true,
                slots: [
                    {
                        start: '09:00',
                        end: '12:00'
                    }
                ]
            },
            wednesday: {
                enabled: false,
                slots: []
            },
            thursday: {
                enabled: true,
                slots: [
                    {
                        start: '09:00',
                        end: '12:00'
                    }
                ]
            },
            friday: {
                enabled: true,
                slots: [
                    {
                        start: '09:00',
                        end: '12:00'
                    }
                ]
            },
            saturday: {
                enabled: false,
                slots: []
            },
            sunday: {
                enabled: false,
                slots: []
            }
        };
        // Gerar slots disponíveis baseados na configuração
        const availableSlots = {};
        const start = new Date(startDate);
        const end = new Date(endDate);
        for(let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)){
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = daysOfWeek[date.getDay()];
            const dayConfig = workingHours[dayOfWeek];
            if (dayConfig && dayConfig.enabled && dayConfig.slots.length > 0) {
                const daySlots = [];
                dayConfig.slots.forEach((slot)=>{
                    const slotTimes = generateTimeSlots(slot.start, slot.end);
                    daySlots.push(...slotTimes);
                });
                if (daySlots.length > 0) {
                    availableSlots[dateStr] = daySlots;
                }
            }
        }
        // Simular alguns horários ocupados para demonstração
        const occupiedSlots = {
            '2024-06-10': [
                '09:00',
                '15:00'
            ],
            '2024-06-11': [
                '10:00',
                '16:00'
            ]
        };
        // Remover horários ocupados dos disponíveis
        Object.keys(occupiedSlots).forEach((dateStr)=>{
            if (availableSlots[dateStr]) {
                availableSlots[dateStr] = availableSlots[dateStr].filter((time)=>!occupiedSlots[dateStr].includes(time));
                // Remover datas sem horários disponíveis
                if (availableSlots[dateStr].length === 0) {
                    delete availableSlots[dateStr];
                }
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            availableSlots
        });
    } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Erro interno do servidor'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__6bce814d._.js.map