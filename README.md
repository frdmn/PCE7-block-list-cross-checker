# PCE7-block-list-cross-checker

A simple CLI (command-line-tool) to check the current block list of [PCE7](http://www.pceo.online) against your Xbox friends and followers.

![](https://up.frd.mn/51nLDKLG64.png)

## Installation

1. Make sure you've met all requirements
2. Clone this repository:

    ```shell
    git clone https://github.com/frdmn/pce7-block-list-cross-checker
    ```

3. Install the dependencies using `npm`:

    ```shell
    npm install
    ```

## Usage

1. Copy and adjust the default configuration. Make sure to add the current PCE7 password and a valid and working XboxAPI.com token:

    ```shell
    cp config.json.sample config.json
    vi config.json
    ```
2. Run the script:

        ```shell
    npm start
    ```

## Contributing

1. Fork it
2. Create your feature branch:

    ```shell
    git checkout -b feature/my-new-feature
    ```

3. Commit your changes:

    ```shell
    git commit -am 'Add some feature'
    ```

4. Push to the branch:

    ```shell
    git push origin feature/my-new-feature
    ```

5. Submit a pull request

## Requirements / Dependencies

* Xbox Live Account
* [XboxAPI.com](https://xboxapi.com/) token

## Version

1.0.0

## License

[MIT](LICENSE)
