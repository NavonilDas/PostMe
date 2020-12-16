const HOST = 'http://localhost:4000/';

export interface PostListItem {
    USER: { name: string }
    content: string
    posted_at: string
    slug: string
    title: string
    _id: string,
    comments: number
};

export interface Post {
    me: boolean,
    post: {
        USER: {
            _id: string,
            name: string
        },
        content: string,
        posted_at: string,
        slug: string,
        title: string,
        _id: string
    }
};

export function APIerrorHandler(err: any, ctx: any) {
    console.error(err);
    if (err?.response?.status === 401) {
        // Unauthorised Clear Cookie
        document.cookie = 'ID=;expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Clear Cookie
    }
    if (err.response?.data?.error) {
        ctx.setState({ apiError: err.response.data.error });
    } else {
        ctx.setState({ apiError: "Something Went Wrong!" });
    }
}

// export function APIerrCallback(err: any, ctx: any, callback: (status: number, data: any) => void) {
//     console.error(err);

//     if (err.response) {
//         callback(err.response.status, err.response.data);
//     }

//     if (err.response?.data?.error) {
//         ctx.setState({ apiError: err.response.data.error });
//     } else {
//         ctx.setState({ apiError: "Something Went Wrong!" });
//     }
// }

export {
    HOST,
};
