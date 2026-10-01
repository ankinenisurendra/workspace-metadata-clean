var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { authenticated, date, entity, set, text, uuid, } from '@microsoft/rayfin-core';
let WorkspaceMetadataSubmission = (() => {
    let _classDecorators = [entity(), authenticated(['create', 'read'], {
            policy: (claims, item) => claims.sub.eq(item.submittedById),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _workspaceId_decorators;
    let _workspaceId_initializers = [];
    let _workspaceId_extraInitializers = [];
    let _workspaceName_decorators;
    let _workspaceName_initializers = [];
    let _workspaceName_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _division_decorators;
    let _division_initializers = [];
    let _division_extraInitializers = [];
    let _businessFunction_decorators;
    let _businessFunction_initializers = [];
    let _businessFunction_extraInitializers = [];
    let _usagePurpose_decorators;
    let _usagePurpose_initializers = [];
    let _usagePurpose_extraInitializers = [];
    let _contacts_decorators;
    let _contacts_initializers = [];
    let _contacts_extraInitializers = [];
    let _submittedById_decorators;
    let _submittedById_initializers = [];
    let _submittedById_extraInitializers = [];
    let _submittedByEmail_decorators;
    let _submittedByEmail_initializers = [];
    let _submittedByEmail_extraInitializers = [];
    let _submittedAt_decorators;
    let _submittedAt_initializers = [];
    let _submittedAt_extraInitializers = [];
    var WorkspaceMetadataSubmission = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [uuid()];
            _workspaceId_decorators = [text({ min: 1, max: 100 })];
            _workspaceName_decorators = [text({ min: 1, max: 200 })];
            _description_decorators = [text({ max: 500 })];
            _division_decorators = [set('CH', 'CS', 'PH', 'EF')];
            _businessFunction_decorators = [text({ min: 1, max: 200 })];
            _usagePurpose_decorators = [set('Productive', 'Non-Productive')];
            _contacts_decorators = [text({ max: 500, optional: true })];
            _submittedById_decorators = [text({ min: 1, max: 256 })];
            _submittedByEmail_decorators = [text({ max: 320, optional: true })];
            _submittedAt_decorators = [date()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _workspaceId_decorators, { kind: "field", name: "workspaceId", static: false, private: false, access: { has: obj => "workspaceId" in obj, get: obj => obj.workspaceId, set: (obj, value) => { obj.workspaceId = value; } }, metadata: _metadata }, _workspaceId_initializers, _workspaceId_extraInitializers);
            __esDecorate(null, null, _workspaceName_decorators, { kind: "field", name: "workspaceName", static: false, private: false, access: { has: obj => "workspaceName" in obj, get: obj => obj.workspaceName, set: (obj, value) => { obj.workspaceName = value; } }, metadata: _metadata }, _workspaceName_initializers, _workspaceName_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _division_decorators, { kind: "field", name: "division", static: false, private: false, access: { has: obj => "division" in obj, get: obj => obj.division, set: (obj, value) => { obj.division = value; } }, metadata: _metadata }, _division_initializers, _division_extraInitializers);
            __esDecorate(null, null, _businessFunction_decorators, { kind: "field", name: "businessFunction", static: false, private: false, access: { has: obj => "businessFunction" in obj, get: obj => obj.businessFunction, set: (obj, value) => { obj.businessFunction = value; } }, metadata: _metadata }, _businessFunction_initializers, _businessFunction_extraInitializers);
            __esDecorate(null, null, _usagePurpose_decorators, { kind: "field", name: "usagePurpose", static: false, private: false, access: { has: obj => "usagePurpose" in obj, get: obj => obj.usagePurpose, set: (obj, value) => { obj.usagePurpose = value; } }, metadata: _metadata }, _usagePurpose_initializers, _usagePurpose_extraInitializers);
            __esDecorate(null, null, _contacts_decorators, { kind: "field", name: "contacts", static: false, private: false, access: { has: obj => "contacts" in obj, get: obj => obj.contacts, set: (obj, value) => { obj.contacts = value; } }, metadata: _metadata }, _contacts_initializers, _contacts_extraInitializers);
            __esDecorate(null, null, _submittedById_decorators, { kind: "field", name: "submittedById", static: false, private: false, access: { has: obj => "submittedById" in obj, get: obj => obj.submittedById, set: (obj, value) => { obj.submittedById = value; } }, metadata: _metadata }, _submittedById_initializers, _submittedById_extraInitializers);
            __esDecorate(null, null, _submittedByEmail_decorators, { kind: "field", name: "submittedByEmail", static: false, private: false, access: { has: obj => "submittedByEmail" in obj, get: obj => obj.submittedByEmail, set: (obj, value) => { obj.submittedByEmail = value; } }, metadata: _metadata }, _submittedByEmail_initializers, _submittedByEmail_extraInitializers);
            __esDecorate(null, null, _submittedAt_decorators, { kind: "field", name: "submittedAt", static: false, private: false, access: { has: obj => "submittedAt" in obj, get: obj => obj.submittedAt, set: (obj, value) => { obj.submittedAt = value; } }, metadata: _metadata }, _submittedAt_initializers, _submittedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WorkspaceMetadataSubmission = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        workspaceId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _workspaceId_initializers, void 0));
        workspaceName = (__runInitializers(this, _workspaceId_extraInitializers), __runInitializers(this, _workspaceName_initializers, void 0));
        description = (__runInitializers(this, _workspaceName_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        division = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _division_initializers, void 0));
        businessFunction = (__runInitializers(this, _division_extraInitializers), __runInitializers(this, _businessFunction_initializers, void 0));
        usagePurpose = (__runInitializers(this, _businessFunction_extraInitializers), __runInitializers(this, _usagePurpose_initializers, void 0));
        contacts = (__runInitializers(this, _usagePurpose_extraInitializers), __runInitializers(this, _contacts_initializers, void 0));
        submittedById = (__runInitializers(this, _contacts_extraInitializers), __runInitializers(this, _submittedById_initializers, void 0));
        submittedByEmail = (__runInitializers(this, _submittedById_extraInitializers), __runInitializers(this, _submittedByEmail_initializers, void 0));
        submittedAt = (__runInitializers(this, _submittedByEmail_extraInitializers), __runInitializers(this, _submittedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _submittedAt_extraInitializers);
        }
    };
    return WorkspaceMetadataSubmission = _classThis;
})();
export { WorkspaceMetadataSubmission };
