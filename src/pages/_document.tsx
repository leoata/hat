import Document, {Html, Head, Main, NextScript} from 'next/document'

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <meta name="description" content="hat homework app by leonardo atalla"/>
                    <link rel="icon" href="/hat.svg" type="image/svg+xml"/>
                </Head>
                <body>
                    <Main/>
                    <footer>
                        <a
                            href="https://leoata.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            made by leonardo atalla '22
                        </a>
                    </footer>
                    <NextScript/>
                </body>
            </Html>
        )
    }
}

export default MyDocument;
