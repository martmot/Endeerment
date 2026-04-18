var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
function normalizeImportance(value) {
    var lowered = String(value !== null && value !== void 0 ? value : 'medium').toLowerCase();
    if (lowered === 'high' || lowered === 'low')
        return lowered;
    return 'medium';
}
function safeParseReflection(content) {
    var _a, _b;
    var fallback = {
        summary: '',
        reflection: content.trim(),
        suggestions: [],
    };
    if (!content)
        return fallback;
    var firstBrace = content.indexOf('{');
    var lastBrace = content.lastIndexOf('}');
    var slice = firstBrace >= 0 && lastBrace > firstBrace
        ? content.slice(firstBrace, lastBrace + 1)
        : content;
    try {
        var parsed = JSON.parse(slice);
        return {
            summary: String((_a = parsed.summary) !== null && _a !== void 0 ? _a : '').slice(0, 240),
            reflection: String((_b = parsed.reflection) !== null && _b !== void 0 ? _b : '').slice(0, 800),
            suggestions: Array.isArray(parsed.suggestions)
                ? parsed.suggestions.slice(0, 3).map(function (s) { return String(s).slice(0, 120); })
                : [],
        };
    }
    catch (_c) {
        var bullets = content.match(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+(.+)/g) || [];
        var suggestions = bullets
            .slice(0, 3)
            .map(function (s) { return s.replace(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+/, '').trim().slice(0, 120); });
        return {
            summary: '',
            reflection: content.replace(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+.+/g, '').trim().slice(0, 800),
            suggestions: suggestions,
        };
    }
}
function safeParseBrainDump(content) {
    var _a;
    var firstBrace = content.indexOf('{');
    var lastBrace = content.lastIndexOf('}');
    var slice = firstBrace >= 0 && lastBrace > firstBrace
        ? content.slice(firstBrace, lastBrace + 1)
        : content;
    try {
        var parsed = JSON.parse(slice);
        var todos = Array.isArray(parsed.todos) ? parsed.todos : [];
        return {
            summary: String((_a = parsed.summary) !== null && _a !== void 0 ? _a : '').slice(0, 240),
            todos: todos
                .map(function (item) {
                var _a, _b;
                var todo = (item !== null && item !== void 0 ? item : {});
                return {
                    text: String((_a = todo.text) !== null && _a !== void 0 ? _a : '').trim().slice(0, 140),
                    importance: normalizeImportance(todo.importance),
                    reason: String((_b = todo.reason) !== null && _b !== void 0 ? _b : '').trim().slice(0, 180),
                };
            })
                .filter(function (item) { return item.text; })
                .slice(0, 8),
        };
    }
    catch (_b) {
        var lines = content
            .split('\n')
            .map(function (line) { return line.replace(/^\s*(?:[-*•]|\d+\.)\s+/, '').trim(); })
            .filter(Boolean)
            .slice(0, 6);
        return {
            summary: '',
            todos: lines.map(function (text) { return ({
                text: text.slice(0, 140),
                importance: 'medium',
                reason: 'Captured from your brain dump.',
            }); }),
        };
    }
}
function safeParseTodoPriorities(content) {
    var firstBrace = content.indexOf('{');
    var lastBrace = content.lastIndexOf('}');
    var slice = firstBrace >= 0 && lastBrace > firstBrace
        ? content.slice(firstBrace, lastBrace + 1)
        : content;
    try {
        var parsed = JSON.parse(slice);
        var priorities = Array.isArray(parsed.priorities) ? parsed.priorities : [];
        return {
            priorities: priorities
                .map(function (item) {
                var _a, _b;
                var todo = (item !== null && item !== void 0 ? item : {});
                return {
                    text: String((_a = todo.text) !== null && _a !== void 0 ? _a : '').trim().slice(0, 140),
                    importance: normalizeImportance(todo.importance),
                    reason: String((_b = todo.reason) !== null && _b !== void 0 ? _b : '').trim().slice(0, 180),
                };
            })
                .filter(function (item) { return item.text; })
                .slice(0, 20),
        };
    }
    catch (_a) {
        return { priorities: [] };
    }
}
function mockReflection(text, mood) {
    var trimmed = text.trim().slice(0, 80);
    return {
        summary: trimmed
            ? "You shared something feeling ".concat(mood, ": \"").concat(trimmed).concat(text.length > 80 ? '…' : '', "\"")
            : "A quiet ".concat(mood, " check-in."),
        reflection: "Thank you for putting this into words. What you wrote sounds specific and real, not small, and it makes sense that it is sitting with you this way. You do not have to solve the whole thing at once to care for yourself inside it.",
        suggestions: [
            'Write the exact next step you are avoiding',
            'Draft one honest message you could send',
            'Move one stressful task to tomorrow',
        ],
    };
}
function mockBrainDump(text) {
    var lines = text
        .split('\n')
        .flatMap(function (line) { return line.split(/[.,;]+/); })
        .map(function (line) { return line.trim(); })
        .filter(Boolean)
        .slice(0, 6);
    var todos = lines.map(function (item, index) { return ({
        text: item
            .replace(/^(i need to|need to|remember to|dont forget to|don't forget to)\s+/i, '')
            .replace(/^\w/, function (char) { return char.toUpperCase(); }),
        importance: (index === 0 ? 'high' : index < 3 ? 'medium' : 'low'),
        reason: index === 0
            ? 'This sounds like the most urgent or blocking thing.'
            : index < 3
                ? 'Useful to keep momentum moving.'
                : 'Important, but less time-sensitive.',
    }); });
    return {
        summary: todos.length
            ? "I pulled out ".concat(todos.length, " clearer todos from your note.")
            : 'Write a few messy thoughts and I will turn them into todos.',
        todos: todos,
    };
}
function mockTodoPriorities(todos) {
    return {
        priorities: todos.slice(0, 20).map(function (text, index) { return ({
            text: text,
            importance: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
            reason: index === 0
                ? 'This looks like the biggest blocker or nearest deadline.'
                : index < 3
                    ? 'Worth doing soon to reduce stress.'
                    : 'Can wait until after the higher-pressure items.',
        }); }),
    };
}
function createSystemPrompt(mode) {
    if (mode === 'brain_dump') {
        return [
            'You are an organizing assistant inside a calming app called Endeerment.',
            'The user will paste a messy brain dump with half-thoughts, reminders, worries, and fragments.',
            'Your job is to turn it into a short list of clear, actionable todos.',
            'Merge duplicates, remove non-actionable filler, and rewrite each item as a direct todo starting with a strong verb.',
            'Infer the likely next concrete action, but do not invent large commitments the user did not imply.',
            'Also estimate importance based on urgency, deadlines, dependency, and emotional weight.',
            'Use only these importance values: high, medium, low.',
            'Give each todo a brief reason under 18 words explaining why it got that importance.',
            'You MUST return a single valid JSON object and nothing else.',
            'Shape: {"summary": string, "todos": [{"text": string, "importance": "high" | "medium" | "low", "reason": string}]}',
            'Return 3-8 todos when possible, each under 12 words.',
        ].join(' ');
    }
    if (mode === 'prioritize_todos') {
        return [
            'You are an organizing assistant inside a calming app called Endeerment.',
            'The user will provide an existing todo list.',
            'Your job is to assign importance to each todo using urgency, dependencies, deadlines, and likely stress reduction.',
            'Use only these importance values: high, medium, low.',
            'Preserve the original todo wording exactly in the text field.',
            'Give each todo a brief reason under 18 words.',
            'You MUST return a single valid JSON object and nothing else.',
            'Shape: {"priorities": [{"text": string, "importance": "high" | "medium" | "low", "reason": string}]}',
        ].join(' ');
    }
    return [
        'You are a warm, supportive companion inside a wellness app called Endeerment.',
        'You are NOT a therapist or medical professional — never diagnose, never give clinical advice, never reference disorders.',
        'Speak gently, validate feelings first, keep responses short.',
        'Everything you say must be grounded in the user\'s exact check-in, not generic wellness advice.',
        'Mention concrete details, situations, people, places, or tensions from the check-in whenever possible.',
        'Do not give generic suggestions like "breathe deeply", "drink water", or "take a walk" unless the user\'s words clearly make that relevant.',
        'Suggestions should feel custom-made for this exact check-in and should help with the specific situation the user described.',
        'At least 2 suggestions must directly reference the user\'s actual context, task, relationship, decision, or emotion.',
        'If the user describes conflict, pressure, avoidance, grief, work stress, guilt, loneliness, or a hard conversation, tailor suggestions to that exact issue.',
        'Prefer suggestions like drafting a specific text, postponing a specific obligation, naming one boundary, writing one sentence, or doing one tiny action related to what they described.',
        'Write suggestions like clean todo items the user could save directly into a task list.',
        'Each suggestion should start with a strong verb and name the specific person, task, message, decision, or problem when possible.',
        'Avoid vague wording like "reflect on it", "take a moment", or "be kind to yourself" unless the user explicitly asked for that kind of support.',
        'You MUST reply with a single valid JSON object and nothing else.',
        'Shape: {"summary": string, "reflection": string, "suggestions": [string, string, string]}',
        '- summary: ONE sentence distilling what the user shared and naming the real issue.',
        '- reflection: 2-3 warm sentences clearly tied to the user\'s exact situation.',
        '- suggestions: array of 2-3 short practical todo-style actions under 14 words.',
    ].join(' ');
}
function createUserPrompt(mode, text, mood, todos) {
    if (mode === 'brain_dump') {
        return "Brain dump:\n".concat(text);
    }
    if (mode === 'prioritize_todos') {
        return "Todos to prioritize:\n".concat(todos.map(function (todo, index) { return "".concat(index + 1, ". ").concat(todo); }).join('\n'));
    }
    return "Mood: ".concat(mood, "\n\nCheck-in:\n").concat(text);
}
function parseByMode(mode, content) {
    if (mode === 'brain_dump')
        return safeParseBrainDump(content);
    if (mode === 'prioritize_todos')
        return safeParseTodoPriorities(content);
    return safeParseReflection(content);
}
function mockByMode(mode, text, mood, todos) {
    if (mode === 'brain_dump')
        return mockBrainDump(text);
    if (mode === 'prioritize_todos')
        return mockTodoPriorities(todos);
    return mockReflection(text, mood);
}
function groqProxy(env) {
    return {
        name: 'endeerment-groq-proxy',
        configureServer: function (server) {
            var _this = this;
            server.middlewares.use('/api/reflect', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var chunks, chunk, e_1_1, raw, _a, _b, text, _c, mood, _d, mode_1, _e, todos, key_1, model_1, systemPrompt_1, userPrompt_1, callGroq, response, detail, data, content, err_1;
                var _this = this;
                var _f, req_1, req_1_1;
                var _g, e_1, _h, _j;
                var _k, _l, _m, _o;
                return __generator(this, function (_p) {
                    switch (_p.label) {
                        case 0:
                            if (req.method !== 'POST') {
                                res.statusCode = 405;
                                res.end('Method Not Allowed');
                                return [2 /*return*/];
                            }
                            _p.label = 1;
                        case 1:
                            _p.trys.push([1, 20, , 21]);
                            chunks = [];
                            _p.label = 2;
                        case 2:
                            _p.trys.push([2, 7, 8, 13]);
                            _f = true, req_1 = __asyncValues(req);
                            _p.label = 3;
                        case 3: return [4 /*yield*/, req_1.next()];
                        case 4:
                            if (!(req_1_1 = _p.sent(), _g = req_1_1.done, !_g)) return [3 /*break*/, 6];
                            _j = req_1_1.value;
                            _f = false;
                            chunk = _j;
                            chunks.push(chunk);
                            _p.label = 5;
                        case 5:
                            _f = true;
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_1_1 = _p.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _p.trys.push([8, , 11, 12]);
                            if (!(!_f && !_g && (_h = req_1.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _h.call(req_1)];
                        case 9:
                            _p.sent();
                            _p.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13:
                            raw = Buffer.concat(chunks).toString() || '{}';
                            _a = JSON.parse(raw), _b = _a.text, text = _b === void 0 ? '' : _b, _c = _a.mood, mood = _c === void 0 ? 'reflective' : _c, _d = _a.mode, mode_1 = _d === void 0 ? 'reflect' : _d, _e = _a.todos, todos = _e === void 0 ? [] : _e;
                            key_1 = env.GROQ_API_KEY;
                            model_1 = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
                            res.setHeader('Content-Type', 'application/json');
                            if (!key_1) {
                                res.end(JSON.stringify(mockByMode(mode_1, text, mood, Array.isArray(todos) ? todos : [])));
                                return [2 /*return*/];
                            }
                            systemPrompt_1 = createSystemPrompt(mode_1);
                            userPrompt_1 = createUserPrompt(mode_1, text, mood, Array.isArray(todos) ? todos : []);
                            callGroq = function (useJsonMode) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, fetch('https://api.groq.com/openai/v1/chat/completions', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: "Bearer ".concat(key_1),
                                            },
                                            body: JSON.stringify(__assign(__assign({ model: model_1, temperature: mode_1 === 'reflect' ? 0.6 : 0.3 }, (useJsonMode ? { response_format: { type: 'json_object' } } : {})), { messages: [
                                                    { role: 'system', content: systemPrompt_1 },
                                                    { role: 'user', content: userPrompt_1 },
                                                ] })),
                                        })];
                                });
                            }); };
                            return [4 /*yield*/, callGroq(true)];
                        case 14:
                            response = _p.sent();
                            if (!!response.ok) return [3 /*break*/, 16];
                            return [4 /*yield*/, callGroq(false)];
                        case 15:
                            response = _p.sent();
                            _p.label = 16;
                        case 16:
                            if (!!response.ok) return [3 /*break*/, 18];
                            return [4 /*yield*/, response.text().catch(function () { return ''; })];
                        case 17:
                            detail = _p.sent();
                            res.statusCode = 502;
                            res.end(JSON.stringify({
                                error: 'groq_upstream_error',
                                status: response.status,
                                detail: detail.slice(0, 500),
                            }));
                            return [2 /*return*/];
                        case 18: return [4 /*yield*/, response.json()];
                        case 19:
                            data = _p.sent();
                            content = (_o = (_m = (_l = (_k = data === null || data === void 0 ? void 0 : data.choices) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.message) === null || _m === void 0 ? void 0 : _m.content) !== null && _o !== void 0 ? _o : '{}';
                            res.end(JSON.stringify(parseByMode(mode_1, content)));
                            return [3 /*break*/, 21];
                        case 20:
                            err_1 = _p.sent();
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({
                                error: 'internal',
                                detail: String(err_1 instanceof Error ? err_1.message : err_1),
                            }));
                            return [3 /*break*/, 21];
                        case 21: return [2 /*return*/];
                    }
                });
            }); });
        },
    };
}
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react(), groqProxy(env)],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 5173,
        },
    };
});
