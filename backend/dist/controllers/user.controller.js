"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const router_1 = require("../decorators/router");
const user_repo_1 = __importDefault(require("../repository/user.repo"));
const constants_1 = require("../constants");
class UserController {
    createUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body || Object.keys(req.body).length === 0) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Request body is empty",
                    });
                }
                const userRepo = new user_repo_1.default();
                const parsedData = types_1.CreateUserSchema.safeParse(req.body);
                if (!parsedData.success) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Invalid input data",
                        error: parsedData.error.errors.map((e) => ({
                            field: e.path.join("."),
                            message: e.message,
                        })),
                    });
                }
                try {
                    const userExists = yield userRepo.getUserByEmail(parsedData.data.email);
                    if (userExists) {
                        return res.status(constants_1.HTTPStatus.CONFLICT).json({
                            status: false,
                            message: "User with this email already exists",
                        });
                    }
                }
                catch (error) {
                    throw new Error("Error checking existing user");
                }
                const userData = {
                    clerkUserId: parsedData.data.clerkUserId,
                    firstName: parsedData.data.firstName,
                    lastName: parsedData.data.lastName,
                    email: parsedData.data.email.toLowerCase().trim(),
                };
                const createUserData = yield userRepo.create(userData);
                return res.status(constants_1.HTTPStatus.CREATED).json({
                    status: true,
                    message: "User created successfully",
                    data: createUserData,
                });
            }
            catch (error) {
                console.error("Error creating user:", error);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to create user",
                });
            }
        });
    }
    getUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clerkUserId } = req.params;
                if (!clerkUserId) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "clerkUserId is required",
                    });
                }
                if (typeof clerkUserId !== "string" || clerkUserId.trim().length === 0) {
                    return res.status(constants_1.HTTPStatus.BAD_REQUEST).json({
                        status: false,
                        message: "Invalid clerkUserId format",
                    });
                }
                const userRepo = new user_repo_1.default();
                const userData = yield userRepo.getUserByClerkUserId(clerkUserId.trim());
                if (!userData) {
                    return res.status(constants_1.HTTPStatus.NOT_FOUND).json({
                        status: false,
                        message: "User not found",
                    });
                }
                return res.status(constants_1.HTTPStatus.OK).json({
                    status: true,
                    message: "User data retrieved successfully",
                    data: userData,
                });
            }
            catch (error) {
                console.error("Error retrieving user:", error);
                return res.status(constants_1.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    status: false,
                    message: "Failed to retrieve user data",
                });
            }
        });
    }
}
exports.default = UserController;
__decorate([
    (0, router_1.POST)("/api/v1/user"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUserData", null);
__decorate([
    (0, router_1.GET)("/api/v1/user/:clerkUserId"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserData", null);
