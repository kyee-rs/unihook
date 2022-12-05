export default interface Command {
    command: string;
    description: string;
    in_list: boolean = true;
    prohibed: boolean = false;
    run: (ctx: Context) => Promise<void>;
}
