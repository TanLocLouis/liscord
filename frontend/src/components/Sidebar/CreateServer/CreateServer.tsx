import Button  from "../../Button/Button.js"

interface CreateServerProps {
    setIsCreateServerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateServer = (props: CreateServerProps) => {
    const handleCloseCreateServerClicked = (e: React.MouseEvent<SVGSVGElement>) => {
        e.preventDefault();
        props.setIsCreateServerOpen(false);
    }

    return (
        <div className="">
            <div className="fixed top-0 left-0 w-full h-full bg-black-1 backdrop-blur-sm"></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-[var(--color-secondary)] rounded-lg flex justify-center items-center">
                <form className="flex flex-col justify-center items-center w-full h-full m-5">
                    <div className="w-full flex justify-between items-center mb-5">
                        <h1 className="text-2xl text-[var(--color-text-primary)]">Create Server</h1>
                        <svg onClick={handleCloseCreateServerClicked} xmlns="http://www.w3.org/2000/svg" width="1.5em" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z"/></svg>
                    </div>
                    <div className="w-full">
                        <label htmlFor="server-name" className="block">Server Name</label>
                        <input type="text" name="server-name" id="server-name" className="m-0 mt-1 block w-full rounded-md border-[var(--color-text-secondary)] shadow-sm sm:text-sm hover:cursor-text" placeholder="Enter server name" />
                    </div>

                    <div className="mt-4 w-full">
                        <Button type="submit" className="w-full">Create Server</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateServer;