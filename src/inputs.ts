import * as vscode from "vscode";

export async function showUserNameBox(value?: string): Promise<string | undefined> {
    const name = await vscode.window.showInputBox({
        prompt: "Input yandex user name",
        placeHolder: "User name",
        value,
        validateInput: text => {
            return !text ? "User name cannot be empty!" : null;
        }
    });

    return name;
}

export async function showPasswordBox(value?: string): Promise<string | undefined> {
    const name = await vscode.window.showInputBox({
      prompt: "Input password",
      placeHolder: "Password",
      value,
      password: true,
      validateInput: text => {
        return !text ? "Password cannot be empty!" : null;
      }
    });
  
    return name;
  }