# ChainWise Automation Guide

## 🚀 Quick Setup

ChainWise is **already configured** with Claude Code automation! This guide helps you utilize the existing automation infrastructure.

## 📊 Current Status

### ✅ **Already Implemented**
- **Claude Configuration**: `.claude/` directory with complete analysis
- **MCP Integration**: 6 servers (context7, filesystem, playwright, shadcn, supabase, web-to-mcp)
- **Security Automation**: Complete security dashboard and vulnerability scanning
- **Project Analysis**: Automated project structure and metrics analysis
- **Validation Suite**: Health checks and integrity monitoring

### 🛠️ **Recently Added**
- **GitHub Actions CI/CD**: `.github/workflows/ci-cd.yml`
- **Project Validation Script**: `scripts/validate-project.sh`
- **Automated Security Scanning**: Secrets detection and dependency auditing

## 🔧 Available Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (warns about TypeScript issues)
```

### Automation & Validation
```bash
./scripts/validate-project.sh    # Run comprehensive project validation
claude mcp list                  # Check MCP server status
```

### Claude Code Integration
```bash
claude init                      # Initialize Claude in new projects
claude mcp add <server>         # Add new MCP servers
/plan                          # Use planning mode for complex features
```

## 📁 Automation Infrastructure

### `.claude/` Directory Structure
```
.claude/
├── analysis/              # Project analysis reports
├── validation/           # Validation history
├── security/             # Security configurations and reports
├── config.json          # Claude configuration
└── settings.local.json   # Local settings
```

### GitHub Actions Pipeline
- **Quality Checks**: TypeScript, ESLint, security auditing
- **Build Testing**: Turbopack builds with artifact storage
- **Deployment**: Automatic Vercel deployment on main/PR
- **Claude Validation**: Project structure and MCP health checks

## 🎯 Using the Automation

### For New Features
1. **Plan Mode**: Use `/plan` to break down complex features
2. **MCP Integration**: Leverage existing Supabase MCP for database operations
3. **Validation**: Run `./scripts/validate-project.sh` before committing
4. **CI/CD**: Push changes trigger automatic validation and deployment

### For Code Quality
1. **ESLint**: Configured but allows builds with errors (see `next.config.ts`)
2. **TypeScript**: Strict mode enabled, errors logged but don't block builds
3. **Security**: Automated secret scanning and dependency auditing
4. **Performance**: Bundle analysis and metrics collection

### For Team Collaboration
1. **CLAUDE.md**: Complete project documentation and instructions
2. **Shared MCP**: Team can use same MCP server configurations
3. **CI/CD Pipeline**: Consistent quality gates for all team members
4. **Validation Reports**: Standardized project health monitoring

## 🔍 Monitoring & Reports

### Security Dashboard
- Location: `.claude/security/reports/security-dashboard.html`
- Features: Vulnerability scanning, compliance checks, security scores

### Project Analysis
- Location: `.claude/analysis/analysis_report.md`
- Metrics: 20,705 lines of code, 114 TypeScript files, comprehensive structure analysis

### Validation Reports
- Location: `.claude/validation/`
- Features: Automated health checks, MCP connectivity, project structure validation

## 📈 Recommended Workflow

### Daily Development
1. Start with `npm run dev`
2. Use Claude Code with `/plan` for feature development
3. Leverage MCP integration for database operations
4. Run validation before committing: `./scripts/validate-project.sh`

### Feature Development
1. **Planning**: Use `/plan` command for complex features
2. **Implementation**: Follow existing patterns in `src/`
3. **Testing**: Manual testing (no test framework configured yet)
4. **Validation**: CI/CD pipeline runs automatic checks

### Deployment
1. **Preview**: Pull requests auto-deploy to Vercel preview
2. **Production**: Main branch deploys to production
3. **Monitoring**: GitHub Actions provide build status and metrics

## 🎯 Next Steps

### Immediate Actions
1. **Team Setup**: Share this guide with team members
2. **Secrets Configuration**: Add Vercel tokens to GitHub secrets for deployment
3. **MCP Validation**: All servers are working, no action needed

### Future Enhancements
1. **Test Framework**: Add Jest/Vitest for automated testing
2. **Performance Monitoring**: Integrate Lighthouse CI for performance tracking
3. **Advanced Security**: Add Snyk or similar for enhanced vulnerability scanning
4. **Team Templates**: Create feature development templates

## 🔗 Key Files

- `CLAUDE.md` - Main project documentation
- `.github/workflows/ci-cd.yml` - CI/CD pipeline
- `scripts/validate-project.sh` - Project validation
- `.claude/config.json` - Claude configuration
- `.mcp.json` - MCP server configuration

## 💡 Tips

1. **Use MCP Integration**: Leverage existing Supabase MCP for database operations
2. **Follow Patterns**: Study existing components and API routes for consistency
3. **Validation First**: Run validation script before major commits
4. **Plan Complex Features**: Use `/plan` command for multi-step development
5. **Monitor Security**: Check security dashboard regularly

---

**The ChainWise project is automation-ready!** 🚀

This infrastructure provides a solid foundation for AI-driven development with Claude Code, comprehensive quality assurance, and streamlined deployment processes.