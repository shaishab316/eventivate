<!--

  Author: @shaishab316
  Last modify: 03/03/2026

 -->

# Module Builder

A small development utility for generating structured backend modules inside:

```
src/modules
```

It scaffolds common architectural layers (service, controller, model, etc.) using centralized templates.

---

## What This Does

When executed (non-production only), the CLI:

1. Prompts for a module name
2. Lets you select file types
3. Creates a folder inside `src/modules/<moduleName>`
4. Generates files using predefined templates
5. Prints a summary table of created files

Example:

If module name = `user`

Generated structure:

```
src/modules/user/
  User.route.ts
  User.service.ts
  User.controller.ts
  User.model.prisma
  User.interface.ts
```

(Depends on selected options.)

---

## How It Works

### 1️⃣ Configuration-Driven

All file behavior is defined in:

```
Builder.constant.ts
```

`BUILDER_FILE_CONFIG` controls:

- folder name
- file extension
- default checkbox selection
- template content

Example:

```ts
service: {
  folder: "services",
  extension: "ts",
  checked: true,
  template: (m: string) => `export const ${m}Services = {};`,
}
```

Adding a new file type = add a new config entry.

---

### 2️⃣ Module Path Resolution

Modules are created inside:

```ts
export const MODULE_DIR = path.resolve(process.cwd(), "src", "modules");
```

This means:

- It uses the current project root (`process.cwd()`).
- It always targets `src/modules`.

If your module directory changes (for example to `src/features`), update:

```ts
MODULE_DIR;
```

to:

```ts
path.resolve(process.cwd(), "src", "features");
```

No other logic needs to change.

---

### 3️⃣ Environment Guard

The builder runs only when:

```ts
process.env.NODE_ENV !== "production";
```

This prevents accidental execution in production environments.

---

## Dependencies

- inquirer — CLI prompts
- ora — spinner feedback
- chalk — terminal styling
- table — summary table rendering
- Node.js fs/path APIs

---

## Usage

Run the script with pnpm:

```
pnpm new-module
```

or

```
make new-module
```

Ensure `NODE_ENV` is not set to `"production"`.

---

## Customization

You can modify:

- File templates
- Default selected file types
- Folder structure
- Extensions
- Naming conventions

All customization happens in `BUILDER_FILE_CONFIG`.

---

This tool is intended for internal project scaffolding and enforces consistent module architecture across your backend codebase.
