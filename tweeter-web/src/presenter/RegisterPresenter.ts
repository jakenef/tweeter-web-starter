import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Buffer } from "buffer";
import { Presenter, View } from "./Presenter";
import { AuthActionPresenter } from "./AuthActionPresenter";

export interface RegisterView extends View {
  navigate: (url: string) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export class RegisterPresenter extends AuthActionPresenter<RegisterView> {
  private userService = new UserService();
  private _imageUrl: string = "";
  private _imageFileExtension: string = "";
  private imageBytes: Uint8Array = new Uint8Array();

  constructor(view: RegisterView) {
    super(view);
  }

  public get imageUrl() {
    return this._imageUrl;
  }

  public get imageFileExtension() {
    return this._imageFileExtension;
  }

  public isRegistrationFormValid(
    firstName: string,
    lastName: string,
    alias: string,
    password: string
  ): boolean {
    return (
      firstName?.trim().length > 0 &&
      lastName?.trim().length > 0 &&
      alias?.trim().length > 0 &&
      password?.length > 0 &&
      this._imageUrl.length > 0 &&
      this._imageFileExtension.length > 0
    );
  }

  public serviceAuth(
    userAlias: string,
    password: string,
    firstName?: string,
    lastName?: string,
    imageBytes?: Uint8Array,
    imageFileExtension?: string
  ): Promise<[User, AuthToken]> {
    return this.userService.register(
      firstName!,
      lastName!,
      userAlias,
      password,
      this.imageBytes,
      this._imageFileExtension
    );
  }

  public navigationAuth(
    originalUrl: string | undefined,
    user: User,
    rememberMe: boolean,
    authToken: AuthToken
  ): void {
    this.view.updateUserInfo(user, user, authToken, rememberMe);
    this.view.navigate(`/feed/${user.alias}`);
  }

  public actionDescription(): string {
    return "register user";
  }

  public doRegister = async (
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    rememberMe: boolean
  ) => {
    await this.doAuthOperation(
      alias,
      password,
      rememberMe,
      undefined,
      firstName,
      lastName,
      this.imageBytes,
      this.imageFileExtension
    );
  };

  private getFileExtension = (file: File): string | undefined => {
    return file.name.split(".").pop();
  };

  public handleImageFile = (file: File | undefined) => {
    if (file) {
      this._imageUrl = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this.imageBytes = bytes;
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this._imageFileExtension = fileExtension;
      }
    } else {
      this._imageUrl = "";
      this.imageBytes = new Uint8Array();
    }
  };
}
