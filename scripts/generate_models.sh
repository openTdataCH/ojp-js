DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_PATH=$DIR/..

OPENAPI_YAML_PATH=$APP_PATH/openapi
OPENAPI_GENERATED_TS_PATH=$APP_PATH/src/types/openapi/generated

SRC_FILES=(
    "ojp-trip-request.yaml"
    "ojp-trip-response.yaml"
    "ojp-stop-event-request.yaml"
    "ojp-stop-event-response.yaml"
    "ojp-location-request.yaml"
    "ojp-location-response.yaml"
    "shared.yml"
)
for file in "${SRC_FILES[@]}"; do
    filename="${file%.*}"
    src_path=$OPENAPI_YAML_PATH/$file
    bundle_src_path=$OPENAPI_YAML_PATH/$filename.gen.bundle.yaml
    dst_path=$OPENAPI_GENERATED_TS_PATH/$filename.ts

    # 1. merge the YAML files into one
    npx --prefix $APP_PATH \
        swagger-cli bundle $src_path \
        -o $bundle_src_path \
        --dereference \
        --type=yaml

    # 2. convert to TS
    npx --prefix $APP_PATH \
        openapi-typescript $bundle_src_path \
        -o $dst_path

    # 3. cleanup
    rm -f $bundle_src_path
    
    # Print the filename without extension
    echo "$file exported to $dst_path"
    echo ""
done
